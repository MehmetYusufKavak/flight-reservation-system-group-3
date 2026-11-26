
from jwt_handler import create_access_token, verify_access_token

user = {
    "userid": 1,
    "email": "ali.yilmaz@mail.com",
    "role": "Customer"
}

token = create_access_token(user)

print("GENERATED TOKEN:")
print(token)

decoded = verify_access_token(token)

print("\nDECODED TOKEN:")
print(decoded)
