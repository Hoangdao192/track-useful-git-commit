var set = new Set();

set.add({
    name: 1,
    age: 1
});

set.add({
    name: 1,
    age: 1
});

var array = [
    {
        name: 1,
        age: 1
    },
    {
        name: 1,
        age: 1
    },
    {
        name: 2,
        age: 1
    }
]

var uniqueSet = Array.from(new Set(array.map(item => item.name)))
                    .map(name => {
                        return array.find(item => item.name === name)
                    });
console.log(uniqueSet);