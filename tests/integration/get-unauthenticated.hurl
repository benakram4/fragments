# 404 Check
# -------------
GET http://localhost:8080/deadend

HTTP/1.1 404
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "not found"

# example:
#  return {
#    status: 'error',
#    error: {
#      code: 404,
#      message: not found,
#    }

