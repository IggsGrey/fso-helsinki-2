const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const cors = require('cors')


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



// maybe make this a function later
const persons = JSON.parse(fs.readFileSync('./db.json', 'utf-8'))


const generateId = (existing_ids) => {
    const max = 9e9
    const id = Math.floor(Math.random() * max)

    // avoid duplicates
    if(existing_ids.includes(id)) {
        return generateId()
    }

    return id
}


app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.post('/api/persons', (req, res) => {

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
    if (isNaN(number)) {
        numberErrors.push('The value of the number field should be a number')
    }

    if(nameErrors.length || numberErrors.length) {
        res.status(422).json({
            errors: {
                name: nameErrors,
                number: numberErrors,
            }
        })
        return
    }


    const person = {
        id: generateId(persons.map(p => p.id)),
        name,
        number,
    }

    const new_persons = persons.concat(person)

    fs.writeFileSync('db.json', JSON.stringify(new_persons))

    res.statusMessage = "New person created successfully"
    res.status(201).json(new_persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);

    const person = persons.find(person => person.id === id)

    if(person) {
        res.json(person)
    } else {
        res.statusMessage = `Person with id ${id} not found`
        res.status(404).end()
    }

})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const new_persons = persons.filter(person => person.id !== id)

    fs.writeFileSync('db.json', JSON.stringify(new_persons))
    res.status(204).json(new_persons)
})

app.get('/info', (req, res) => {
    const content = `Phonebook has info for ${persons.length} people<br /><br />${(new Date).toString()}`;
    res.send(content)
})



const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
})

