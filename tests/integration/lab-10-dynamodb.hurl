# tests/integration/lab-10-dynamodb
# POST a new JSON fragment to http://localhost:8080 as an authorized user
# 1.
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
{"service":"DynamoDB"}

# 2.
# Confirm that the server returns a 201
HTTP/1.1 201

[Asserts]
header "Content-Type" == "application/json; charset=utf-8"
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.size" == 22


# capture the Location header value and the fragment's id 
# in variables named fragment1_url and fragment1_id
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"



# 3.
# GET the fragment from the Location URL + info
GET {{fragment1_url}}/info
Content-Type: application/json; charset=utf-8
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8




