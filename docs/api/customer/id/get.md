# Get customer
Returns the first customer with the given id.

**URL**:
`GET` `/customer/:id`

**Content-Type**: `application/json`

**Parameters**:

| Parameter | Required | Type |
| :-------- | :------- | :--- |
| `id` | `true` | `integer` |

## Responses

**Code**:
`200 OK`

**Content example**:
```json
{
  "success": true,
  "message": "Fetched customer",
  "customer": { }
}
```

---

**Code**:
`403 Forbidden`

**Content example**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
