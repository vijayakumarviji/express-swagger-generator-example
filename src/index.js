let express = require('express');
var bodyParser = require('body-parser')
let app = express();
let joi = require('@hapi/joi');
let { generateSwagger } = require('getswagger');

app.use(bodyParser.json())

let validateSchema = require('../middlewares/scheme_validator');
let apiInfos = [
    {
        method: 'post',
        apiPath: '/user/:name',
        middlewares: [(req, res, next) => {
            console.log('App middleware')
            next();
        }],
        hasValidation: {
            request: true,
            response: true
        },
        schema: {
            request: {
                params: joi.object().keys({
                    name: joi.string()
                }),
                query: joi.object().keys({
                    name: joi.string()
                }),
                body: joi.object().keys({
                    name: joi.string().required()
                }).required(),
                headers: joi.object().keys({
                    name: joi.string()
                })
            },
            response: joi.object().keys({
                name: joi.string().required()
            }).required()
        },
        summary: 'Get User',
        tags: ['USER']
    }
];

generateSwagger(express, app, {
    apiInfos,
    path: '/api-docs',
    pathRegex: '',
    swaggerInfo: {
        schemes: [
            "https",
            "http"
        ],
        info: {
            title: "Test title",
            description: "Test desc",
            version: "1.0.0"
        },
        tags: [
            {
                name: 'USER',
                description: 'User related api'
            }
        ]
    }
});

apiInfos.forEach(apiInfo => {
    let {
        method,
        apiPath,
        middlewares,
        schema,
        hasValidation: {
            request: validateRequest = false,
            response: validateResponse = false
        } = {}
    } = apiInfo;

    validateRequest && middlewares.splice(0, 0, validateSchema(schema.request, 'request'));
    validateResponse && middlewares.push(validateSchema(schema.response, 'response'));
    app[method](apiPath, ...middlewares);
})

app.use((req, res   ) => {
    let response = {
        code: 200,
        messageCode: 'Success',
        data: req.responseData
    }
    return res.send(response);
});

app.use((error, req, res, next) => {
    let response = {
        code: 500,
        messageCode: 'Internal_Server_Error'
    };
    if (error.isSchemaError) {
        response.code = 400;
        response.messageCode = 'Bad_Request';
        response.message = error.error;
    }
    return res.status(response.code).send(response)
});

app.listen(3000);