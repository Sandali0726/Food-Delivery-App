# Rider Registration API - Request Examples

## Option 1: Original Endpoint (Advanced) - /api/auth/register

This endpoint requires sending JSON data as a separate part.

### Using curl (Command Line)

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -F 'data={"email":"gayashankavishka2@gmail.com","password":"1234567","first_name":"Gayashan","last_name":"De Silva","phone_number":"0713553579","default_lat":34353536.65,"default_lng":45446646.45,"licence":"http/hdefe.com","vehicle_no":"SP-4565"};type=application/json' \
  -F 'file=@/path/to/your/image.jpg;type=image/jpeg'
```

### Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:8080/api/auth/register`
3. **Body Type**: form-data
4. **Form Data**:
   - **Key**: `data`
     - **Type**: Text
     - **Value**: `{"email":"gayashankavishka2@gmail.com","password":"1234567","first_name":"Gayashan","last_name":"De Silva","phone_number":"0713553579","default_lat":34353536.65,"default_lng":45446646.45,"licence":"http/hdefe.com","vehicle_no":"SP-4565"}`
   - **Key**: `file`
     - **Type**: File
     - **Value**: Select your image file

## Option 2: Simple Form Endpoint (Recommended) - /api/auth/register-form

This endpoint accepts each field as a separate form parameter. **This is easier to use!**

### Using curl (Command Line)

```bash
curl -X POST http://localhost:8080/api/auth/register-form \
  -F 'email=gayashankavishka2@gmail.com' \
  -F 'password=1234567' \
  -F 'first_name=Gayashan' \
  -F 'last_name=De Silva' \
  -F 'phone_number=0713553579' \
  -F 'default_lat=34353536.65' \
  -F 'default_lng=45446646.45' \
  -F 'licence=http/hdefe.com' \
  -F 'vehicle_no=SP-4565' \
  -F 'file=@/path/to/your/image.jpg'
```

### Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:8080/api/auth/register-form`
3. **Body Type**: form-data
4. **Form Data**:
   - **Key**: `email`, **Type**: Text, **Value**: `gayashankavishka2@gmail.com`
   - **Key**: `password`, **Type**: Text, **Value**: `1234567`
   - **Key**: `first_name`, **Type**: Text, **Value**: `Gayashan`
   - **Key**: `last_name`, **Type**: Text, **Value**: `De Silva`
   - **Key**: `phone_number`, **Type**: Text, **Value**: `0713553579`
   - **Key**: `default_lat`, **Type**: Text, **Value**: `34353536.65`
   - **Key**: `default_lng`, **Type**: Text, **Value**: `45446646.45`
   - **Key**: `licence`, **Type**: Text, **Value**: `http/hdefe.com`
   - **Key**: `vehicle_no`, **Type**: Text, **Value**: `SP-4565`
   - **Key**: `file`, **Type**: File, **Value**: Select your image file

## Using JavaScript Fetch API

```javascript
const formData = new FormData();

// JSON data part
const jsonData = {
    email: "gayashankavishka2@gmail.com",
    password: "1234567",
    first_name: "Gayashan",
    last_name: "De Silva",
    phone_number: "0713553579",
    default_lat: 34353536.65,
    default_lng: 45446646.45,
    licence: "http/hdefe.com",
    vehicle_no: "SP-4565"
};

formData.append('data', new Blob([JSON.stringify(jsonData)], {type: 'application/json'}));
formData.append('file', fileInput.files[0]); // fileInput is an HTML input element

fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Using Python requests

```python
import requests
import json

url = "http://localhost:8080/api/auth/register"

# JSON data
json_data = {
    "email": "gayashankavishka2@gmail.com",
    "password": "1234567",
    "first_name": "Gayashan",
    "last_name": "De Silva",
    "phone_number": "0713553579",
    "default_lat": 34353536.65,
    "default_lng": 45446646.45,
    "licence": "http/hdefe.com",
    "vehicle_no": "SP-4565"
}

files = {
    'data': ('', json.dumps(json_data), 'application/json'),
    'file': ('image.jpg', open('/path/to/your/image.jpg', 'rb'), 'image/jpeg')
}

response = requests.post(url, files=files)
print(response.json())
```

## Important Notes

1. **Content-Type**: Do NOT manually set the Content-Type header when using multipart/form-data. Let the client set it automatically.

2. **File Size**: Maximum file size is 50MB (configurable in application.properties).

3. **File Types**: Only image files are accepted (image/jpeg, image/png, image/gif, etc.).

4. **JSON Structure**: The "data" part must contain valid JSON matching the registerDto structure.

5. **Two Parts Required**: 
   - `data`: Your JSON data as a string or blob
   - `file`: The actual image file

## Error Responses

- **400 Bad Request**: Invalid data or file validation failed
- **413 Payload Too Large**: File size exceeds 50MB limit
- **500 Internal Server Error**: Server error during processing

## Success Response

```json
{
    "email": "gayashankavishka2@gmail.com",
    "password": "encoded_password",
    "first_name": "Gayashan",
    "last_name": "De Silva",
    "phone_number": "0713553579",
    "default_lat": 34353536.65,
    "default_lng": 45446646.45,
    "img_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/abc123.jpg",
    "licence": "http/hdefe.com",
    "vehicle_no": "SP-4565"
}
```
