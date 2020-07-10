let express = require('express');
let app = express();
let joi = require('@hapi/joi');
let { generateSwagger } = require('getswagger')

let apiInfos = [
    {
        method: 'post',
        apiPath: '/user',
        middlewares: [(req, res, next) => {
            next();
        }],
        hasValidation: {
            request: false,
            response: false
        },
        schema: {
            path: '',
            query: '',
            body: joi.object(),
            header: '',
            response: joi.object()
        },
        summary: 'Get User',
        tags: ['USER']
    }
];

generateSwagger(express, app, {
    apiInfos,
    path: '/api-docs',
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
    let { method, apiPath, middlewares } = apiInfo;
    app[method](apiPath, ...middlewares);
})

app.use((req, res, next) => {
    res.send({
        name: 'Vijay2'
    });
})
app.listen(3000);