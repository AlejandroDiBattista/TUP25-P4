from pathlib import Path
from db import init_db

def main():
    # Remove existing sqlite DB if present to start fresh
    db_file = Path("ecommerce.db")
    if db_file.exists():
        try:
            db_file.unlink()
            print("Removed existing ecommerce.db")
        except Exception as e:
            print(f"Could not remove existing DB: {e}")

    # Initialize DB and load products from productos.json
    init_db(load_products=True)
    print("Database initialized and sample products loaded.")

if __name__ == '__main__':
    main()
