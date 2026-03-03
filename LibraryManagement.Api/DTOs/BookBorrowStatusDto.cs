namespace LibraryManagement.Api.DTOs
{
    public class BookBorrowStatusDto
    {
        /// <summary>
        /// null = no record, "Pending", "Approved", "Rejected", "Returned", "Overdue"
        /// </summary>
        public string? Status { get; set; }
        public int? BorrowId { get; set; }
        public DateTime? DueDate { get; set; }

        // Populated only when Status == "Overdue"
        public int? FineId { get; set; }
        public decimal? FineAmount { get; set; }
    }
}
