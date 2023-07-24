const mongoose = require('mongoose')


if (process.argv.length < 3) {
    console.log('No password input');
    process.exit(1)
}

const password = process.argv[2]


const connection_string = `mongodb+srv://jaygreyjg:${password}@cluster0.bit8jvq.mongodb.net/?retryWrites=true&w=majority`


mongoose.connect(connection_string)


const personSchema = mongoose.Schema({
    name: String,
    number: String
})


const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 5) {
    console.log('phonebook:')
    Person.find({}).then(res => {
        res.forEach(person => console.log(`${person.name} ${person.number}`))
        mongoose.connection.close()
    })
} else {
    const name = process.argv[3]
    const number = process.argv[4]
    const person = Person({
        name,
        number,
    })

    person.save().then(result => {
        console.log(`added ${result.name} to phonebook`)
        mongoose.connection.close()
    })

}




