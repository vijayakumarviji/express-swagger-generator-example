let express = require('express');
let app = express();
let joi = require('@hapi/joi');
let { generateSwagger } = require('getswagger')

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
                path: joi.object().keys({
                    name: joi.string()
                }),
                query: joi.object().keys({
                    name: joi.string()
                }),
                body: joi.object().keys({
                    name: joi.string()
                }),
                header: joi.object().keys({
                    name: joi.string()
                }),
            },
            response: joi.object()
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
        hasValidation: {
            request: validateRequest = false,
            response: validateResponse = false
        } = {}
    } = apiInfo;

    validateRequest && middlewares.splice(0, 0, (req, res, next) => {
        console.log('Request validation')
        next();
    });
    middlewares.splice(0, 0, (req, res, next) => {
        console.log('Entry logger')
        next();
    });
    validateResponse && middlewares.push((req, res, next) => {
        console.log('Response validation')
        next();
    });
    middlewares.push((req, res, next) => {
        console.log('Exit logger')
        next();
    });
    app[method](apiPath, ...middlewares);
})

app.use((req, res, next) => {
    return res.send({
        name: 'Vijay2'
    });
});

app.use((error, req, res, next) => {
    console.log('Error handler');
    return res.sendStatus(400)
});

app.listen(3000);