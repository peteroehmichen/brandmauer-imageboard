var startArray = [
    {
        id: 10,
        response_to: 0,
    },
    {
        id: 12,
        response_to: 0,
    },
    {
        id: 13,
        response_to: 12,
    },
    {
        id: 14,
        response_to: 10,
    },
    {
        id: 15,
        response_to: 13,
    },
    {
        id: 18,
        response_to: 12,
    },
    {
        id: 19,
        response_to: 13,
    },
    {
        id: 21,
        response_to: 19,
    },
    {
        id: 22,
        response_to: 21,
    },
    {
        id: 23,
        response_to: 0,
    },
];
var endArray = [];
var i, j, k;
var temp;
console.log("start:", startArray);
var indent = 0;
// pushing the base elements into the parent, sorted by ID/time
for (i = 0; i < startArray.length; i++) {
    if (startArray[i].response_to == 0) {
        startArray[i].indent = indent;
        endArray.push(startArray[i]);
        startArray.splice(i, 1);
        i--;
    }
}

// take base1 and compare all remaing to it -- if response to it then, move right after parent and remove
while (startArray.length > 0) {
    indent++;
    for (i = 0; i < endArray.length; i++) {
        for (j = 0; j < startArray.length; j++) {
            if (
                endArray[i].indent == indent - 1 &&
                endArray[i].id == startArray[j].response_to
            ) {
                console.log(
                    `ID ${startArray[j].id} is a response on level ${indent} to ID ${endArray[i].id}`
                );
                startArray[j].indent = indent;
                temp = startArray[j];
                startArray.splice(j, 1);
                j--;
                endArray.splice(i + 1, 0, temp);
            }
        }
    }
}

console.log("start:", startArray);
console.log("end:", endArray);

/*

// console.log("comments START:", comments);
var remain = [...comments];
var parents = [];
var i, j, k;
var temp = [];
var indent = 0;

// filtering root elements with empty response_to
for (i = 0; i < remain.length; i++) {
    if (remain[i].response_to < 1) {
        remain[i].indent = indent + "px";
        parents.push(remain[i]);
        remain.splice(i, 1);
        i--;
    }
}
console.log("after first run of Array size:", comments.length);
console.log("base elements:", parents.length);
console.log("sub elements:", remain.length);
// compare all parents and find the connected element and include after.
while (remain.length > 0) {
    indent += 15;
    for (i = 0; i < parents.length; i++) {
        k = i;
        for (j = 0; j < remain.length; j++) {
            if (parents[i].id == remain[j].response_to) {
                remain[j].indent = indent + "px";
                // parents.splice(i + 1, 0, remain[j]);
                temp.push(remain[j]);
                // parents.splice(k+1, 0, remain[j]);
                // k++;
                remain.splice(j, 1);
                j--;
            }
        }
    }
}

*/
