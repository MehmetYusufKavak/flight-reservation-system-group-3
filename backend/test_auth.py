
from auth import login_user

# Customer login test
customer = login_user(
    "ali.yilmaz@mail.com",
    "ali123"
)

print("CUSTOMER TEST:")
print(customer)

# Administrator login test
admin = login_user(
    "admin@mail.com",
    "admin123"
)

print("\nADMIN TEST:")
print(admin)

# Wrong password test
wrong = login_user(
    "ali.yilmaz@mail.com",
    "wrongpassword"
)

print("\nWRONG PASSWORD TEST:")
print(wrong)
