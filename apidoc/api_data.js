define({ "api": [
  {
    "type": "get",
    "url": "/resetpass/:username/:token",
    "title": "Get Link Reset Password",
    "group": "Email",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Username",
            "description": "<p>User's nickname</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Token",
            "description": "<p>Temporary token validation</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Response",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Response.msg",
            "description": "<p>Simple message saying it's a success</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success ",
          "content": "{\n    \"msg\": \"We can help you JohnDoe !\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Field error",
          "content": "{\n    \"errMsg\": \"No user found !\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Email",
    "name": "GetResetpassUsernameToken"
  },
  {
    "type": "get",
    "url": "/verifyAccount/:username/:token",
    "title": "Confirm Account",
    "group": "Email",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Username",
            "description": "<p>User's nickname</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Token",
            "description": "<p>Temporary token validation</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Response",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Response.msg",
            "description": "<p>Account verified</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Validation",
          "content": "{\n    \"msg\": \"Congrats JohnDoe ! Your account is validated\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Field error",
          "content": "{\n    \"errMsg\": \"Invalid Token\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Email",
    "name": "GetVerifyaccountUsernameToken"
  },
  {
    "type": "post",
    "url": "/resetpass",
    "title": "Reset a Password",
    "group": "Email",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Email",
            "description": "<p>User's email</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Response",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Response.msg",
            "description": "<p>Email of resetting password sent</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success ",
          "content": "{\n    \"msg\": \"The resetting's password link has been sent by emal\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Field error",
          "content": "{\n    \"errMsg\": \"No user found\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Email",
    "name": "PostResetpass"
  },
  {
    "type": "post",
    "url": "/resetpass/:username/:token",
    "title": "New Password",
    "group": "Email",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Username",
            "description": "<p>User's nickname</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Token",
            "description": "<p>Temporary token validation</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Response",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Response.msg",
            "description": "<p>Success</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success ",
          "content": "{\n    \"msg\": \"Password changed\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Field error",
          "content": "{\n    \"errMsg\": \"Passwords/Tokens did not match\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Email",
    "name": "PostResetpassUsernameToken"
  },
  {
    "type": "post",
    "url": "/signin",
    "title": "Connection Account & Sending Confirmation",
    "group": "Sign",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "Params",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Params.fields",
            "description": "<p>mandatory fields =&gt; firstname, lastname, username, email, password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Response",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Response.token",
            "description": "<p>JSON-WebToken generate</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Response.user",
            "description": "<p>Informations about user logged</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Connection",
          "content": "{\n    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"\n    \"user\": {\n        \"field1\": \"value1\",\n        \"field2\": \"value2\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Success Email Resending",
          "content": "{\n    \"msg\": \"Email confirmation re-sent\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Field error",
          "content": "{\n    \"errMsg\": {\n        \"field\": \"This field is not well formated\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Email error",
          "content": "{\n    \"errMsg\": \"Account not verified\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Sign",
    "name": "PostSignin"
  },
  {
    "type": "post",
    "url": "/signup",
    "title": "Register Account",
    "group": "Sign",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "Params",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Params.fields",
            "description": "<p>mandatory fields =&gt; firstname, lastname, username, email, password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Response",
            "description": "<p>Format JSON</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Response.msg",
            "description": "<p>Account created, confirmation email sent</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Registration",
          "content": "{\n    \"msg\": \"User has been created, check your email and confirm your account\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Field or email error",
          "content": "{\n    \"errMsg\": {\n        \"field\": \"This field is not well formated\"\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Sign",
    "name": "PostSignup"
  }
] });
