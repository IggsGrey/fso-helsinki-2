require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require("./database/models/Person")


const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())


const morganMiddleware = morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        JSON.stringify(req.body),
    ].join(' ')
})

app.use(morganMiddleware)


app.get('/api/persons', (req, res, next) => {
    Person
    .find({})
    .then(persons => {
        res.json(persons)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    Person
    .find({})
    .then(persons => {
        const { name, number } = req.body

        const nameErrors = []
        const numberErrors = []

        if (!name) {
            nameErrors.push('The name field is required')
        }
        if (persons.some(person => person.name === name)) {
            nameErrors.push('The name already exists')
        }
        if (!number) {
            numberErrors.push('The number field is required')
        }

        if (nameErrors.length || numberErrors.length) {
            res.status(422).json({
                error: [...nameErrors, ...numberErrors][0]
            })
            // res.status(422).json({
            //     errors: {
            //         name: nameErrors,
            //         number: numberErrors,
            //     }
            // })
            return
        }


        const person = {
            name,
            number,
        }

        const new_person = new Person(person)

        new_person
        .save()
        .then(() => {
            res.statusMessage = "New person created successfully"
            res.status(201).json(new_person)
        })
        .catch(error => {
            console.log('we caught the error')
            next(error)
        })
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;

    Person
    .findById(id)
    .then(person => {
        if(person) {
            res.json(person)
        } else {
            res.statusMessage = `Person with id ${id} not found`
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id

    Person
    .findByIdAndRemove(id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id

    const person = {
        name: req.body.name,
        number: req.body.number,
    }

    Person
    .findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
        res.status(201).json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    Person
    .find({})
    .then(persons => {
        const content = `Phonebook has info for ${persons.length} people<br /><br />${(new Date).toString()}`;
        res.send(content)
    })
    .catch(error => next(error))
})






const errorHandler = (error, request, response, next) => {
    console.log(`Error details, name is ${error.name}, ${error.message}`)

    if (error.name === 'ValidationError') {
        return response.status(422).json({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)




const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
})

