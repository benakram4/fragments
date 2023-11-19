# tests/integration/lab-9-s3
# Authenticated POST to /v1/fragments
# 1.
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# 2.
HTTP/1.1 201

[Captures]
url: header "Location"

# 3.
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 4.
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8


[Asserts]
body == "Hello S3!"

# 5.
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# 6.
HTTP/1.1 200

# 7.
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 8.
HTTP/1.1 404




