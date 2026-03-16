namespace LibraryManagement.Api.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int AvailableQuantity { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Foreign keys and Navigation properties
        public int AuthorId { get; set; }
        public Author Author { get; set; } = null!;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        // Navigation property
        public ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();

        public void ApproveBorrow()
        {
            if (AvailableQuantity <= 0)
            {
                throw new InvalidOperationException("No items available for borrow.");
            }
            AvailableQuantity--;
        }

        public void ReturnBook()
        {
            if (AvailableQuantity >= Quantity)
            {
                throw new InvalidOperationException("Cannot return book. Available quantity already exceeds total quantity.");
            }
            AvailableQuantity++;
        }

        public void AdjustQuantity(int newQuantity)
        {
            int delta = newQuantity - Quantity;
            int newAvailable = AvailableQuantity + delta;
            
            if (newAvailable < 0)
            {
                throw new InvalidOperationException("Cannot reduce quantity below currently borrowed items.");
            }
            
            Quantity = newQuantity;
            AvailableQuantity = newAvailable;
        }
    }
}
