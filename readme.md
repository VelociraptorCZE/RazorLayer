# RazorLayer

### configuration

```js
const RazorLayer = require("razor-layer");
const db = new RazorLayer({
   config: {
       host: "localhost",
       user: "root",
       password: "",
       database: "_lang_proto"
   }
});
```

### examples

```js
app.get("/", async (request, resource) => {
    const results = await db.table("match_result")
                // when you omit third parameter, the default operator is "="
                .where("score", 50, ">=")
                .andWhere("is_public", true)
                .orderBy("score", "DESC")
                .limit(3)
                .offset(1)
                .findAll();
    
    // you can also try orWhere() and orderByRand()

    // find a record by id
    const match = await db.table("match_result").find(23);

    const newMatch = { score: 999, is_public: true };
    const { insertId } = await db.table("match_result").insert(newMatch);
    
    // updating match info (when updating row you have to include row id)
    newMatch.id = insertId; // e.g. { id: 4, score: 999, is_public: true }
    newMatch.score = 69;
    db.table("match_result").update(newMatch);

    // ...
});
```