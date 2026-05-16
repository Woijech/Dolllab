using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dollab_Backend.Migrations
{
    /// <inheritdoc />
    public partial class RemovePriceFromDoll : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReleaseYear",
                table: "Dolls",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReleaseYear",
                table: "Dolls");
        }
    }
}
