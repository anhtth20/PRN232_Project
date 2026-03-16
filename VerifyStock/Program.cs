using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace VerifyStock
{
    class Program
    {
        static async Task Main(string[] args)
        {
            try
            {
                var client = new HttpClient { BaseAddress = new Uri("http://localhost:5237/api/") };
                string rand = Guid.NewGuid().ToString("N").Substring(0, 4);

                Console.WriteLine("--- 1. Registering Librarian ---");
                string libUser = "lib" + rand;
                var regRes = await client.PostAsJsonAsync("Auth/register", new { Username = libUser, Password = "password", FullName = "Lib " + rand, Email = libUser + "@test.com", Role = "Librarian" });
                string regText = await regRes.Content.ReadAsStringAsync();
                Console.WriteLine($"Register Status: {regRes.StatusCode}");

                Console.WriteLine("--- 2. Logging in Librarian ---");
                var loginRes = await client.PostAsJsonAsync("Auth/login", new { Username = libUser, Password = "password" });
                string loginText = await loginRes.Content.ReadAsStringAsync();
                var tokenObj = System.Text.Json.JsonSerializer.Deserialize<LoginResponse>(loginText, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                string tokenLib = tokenObj!.Token;

                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenLib);

                Console.WriteLine("--- 3. Creating Author & Category ---");
                var authorRes = await client.PostAsJsonAsync("Authors", new { Name = "Auth " + rand });
                var author = await authorRes.Content.ReadFromJsonAsync<IdResponse>();
                var catRes = await client.PostAsJsonAsync("Categories", new { Name = "Cat " + rand });
                var cat = await catRes.Content.ReadFromJsonAsync<IdResponse>();

                Console.WriteLine("--- 4. Creating Book (Quantity: 3) ---");
                var form = new MultipartFormDataContent();
                form.Add(new StringContent("Book " + rand), "Title");
                form.Add(new StringContent(author!.Id.ToString()), "AuthorId");
                form.Add(new StringContent(cat!.Id.ToString()), "CategoryId");
                form.Add(new StringContent("3"), "Quantity");
                form.Add(new StringContent("Desc " + rand), "Description");
                
                var bookRes = await client.PostAsync("Books", form);
                var book = await bookRes.Content.ReadFromJsonAsync<BookResponse>();
                Console.WriteLine($"Book Created: Q={book!.Quantity}, Avail={book.AvailableQuantity}");

                Console.WriteLine("--- 5. Registering Borrower 1 ---");
                string borrUser1 = "borr1" + rand;
                await client.PostAsJsonAsync("Auth/register", new { Username = borrUser1, Password = "password", FullName = "Borr1 " + rand, Email = borrUser1 + "@test.com", Role = "Borrower" });
                var loginB1 = await client.PostAsJsonAsync("Auth/login", new { Username = borrUser1, Password = "password" });
                string tokenB1 = (await loginB1.Content.ReadFromJsonAsync<LoginResponse>())!.Token;

                Console.WriteLine("--- 6. Borrower 1 Requests Borrow ---");
                var b1Client = new HttpClient { BaseAddress = client.BaseAddress };
                b1Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenB1);
                var b1Res = await b1Client.PostAsJsonAsync("Borrow", new { BookId = book.Id, DueDate = DateTime.UtcNow.AddDays(14).ToString("yyyy-MM-ddTHH:mm:ssZ") });
                var b1Borrow = await b1Res.Content.ReadFromJsonAsync<IdResponse>();

                Console.WriteLine("--- 7. Approving Borrow 1 ---");
                await client.PutAsync($"Borrow/{b1Borrow!.Id}/approve", null);

                Console.WriteLine("--- 8. Updating Quantity to 5 ---");
                var updateForm = new MultipartFormDataContent();
                updateForm.Add(new StringContent("Book " + rand), "Title");
                updateForm.Add(new StringContent(author.Id.ToString()), "AuthorId");
                updateForm.Add(new StringContent(cat.Id.ToString()), "CategoryId");
                updateForm.Add(new StringContent("5"), "Quantity");
                updateForm.Add(new StringContent("Desc " + rand), "Description");
                await client.PutAsync($"Books/{book.Id}", updateForm);

                Console.WriteLine("--- 9. Registering Borrower 2 ---");
                string borrUser2 = "borr2" + rand;
                await client.PostAsJsonAsync("Auth/register", new { Username = borrUser2, Password = "password", FullName = "Borr2 " + rand, Email = borrUser2 + "@test.com", Role = "Borrower" });
                var loginB2 = await client.PostAsJsonAsync("Auth/login", new { Username = borrUser2, Password = "password" });
                string tokenB2 = (await loginB2.Content.ReadFromJsonAsync<LoginResponse>())!.Token;

                Console.WriteLine("--- 10. Borrower 2 Requests Borrow ---");
                var b2Client = new HttpClient { BaseAddress = client.BaseAddress };
                b2Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenB2);
                var b2Res = await b2Client.PostAsJsonAsync("Borrow", new { BookId = book.Id, DueDate = DateTime.UtcNow.AddDays(14).ToString("yyyy-MM-ddTHH:mm:ssZ") });
                var b2Borrow = await b2Res.Content.ReadFromJsonAsync<IdResponse>();

                Console.WriteLine("--- 11. Approving Borrow 2 ---");
                await client.PutAsync($"Borrow/{b2Borrow!.Id}/approve", null);

                // Now Borrowed = 2. Total = 5. Available = 3.
                // Update Quantity to 1 -> Delta = -4 -> New Available = 3 - 4 = -1 -> Should Fail!

                Console.WriteLine("--- 12. Testing Negative Stock (Update Q to 1) ---");
                var failForm = new MultipartFormDataContent();
                failForm.Add(new StringContent("Book " + rand), "Title");
                failForm.Add(new StringContent(author.Id.ToString()), "AuthorId");
                failForm.Add(new StringContent(cat.Id.ToString()), "CategoryId");
                failForm.Add(new StringContent("1"), "Quantity");
                failForm.Add(new StringContent("Desc " + rand), "Description");
                var failRes = await client.PutAsync($"Books/{book.Id}", failForm);
                string failText = await failRes.Content.ReadAsStringAsync();
                Console.WriteLine($"Update Fail Res: {failText}");
                if (!failText.Contains("Cannot reduce quantity")) throw new Exception("Should fail reducing quantity below borrowed");

                Console.WriteLine("--- 13. Cancelling Borrow 1 ---");
                await client.PutAsync($"Borrow/{b1Borrow.Id}/cancel", null);
                var bookCheck = await client.GetFromJsonAsync<BookResponse>($"Books/{book.Id}");
                Console.WriteLine($"After Cancel 1: Avail={bookCheck!.AvailableQuantity}");
                if (bookCheck.AvailableQuantity != 4) throw new Exception("Available should be 4 after cancel 1");

                Console.WriteLine("--- 14. Cancelling Borrow 2 ---");
                await client.PutAsync($"Borrow/{b2Borrow.Id}/cancel", null);
                bookCheck = await client.GetFromJsonAsync<BookResponse>($"Books/{book.Id}");
                Console.WriteLine($"After Cancel 2: Avail={bookCheck!.AvailableQuantity}");
                if (bookCheck.AvailableQuantity != 5) throw new Exception("Available should be 5 after cancel 2");

                Console.WriteLine("--- Verification SUCCESS ---");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FATAL EXCEPTION: {ex}");
            }
        }
    }

    public class LoginResponse { public string Token { get; set; } = ""; }
    public class IdResponse { public int Id { get; set; } }
    public class BookResponse { public int Id { get; set; } public int Quantity { get; set; } public int AvailableQuantity { get; set; } }
}
