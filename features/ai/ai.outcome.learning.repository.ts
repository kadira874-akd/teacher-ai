import {
supabase
}
from "@/lib/supabase";



export async function saveAIStrategy({

strategyName,

condition,

recommendation,

successCount,

failedCount,

successRate


}:{

strategyName:string;

condition:any;

recommendation:string;

successCount:number;

failedCount:number;

successRate:number;


}){



const {

data:existing

}

=

await supabase

.from(
"ai_learning_strategies"
)

.select("*")

.eq(
"strategy_name",
strategyName
)

.single();





if(existing){



const {

data,

error

}

=

await supabase

.from(
"ai_learning_strategies"
)

.update({

condition,

recommendation,

success_count:
successCount,

failed_count:
failedCount,

success_rate:
successRate,

updated_at:
new Date()

})

.eq(
"id",
existing.id
)

.select()

.single();



if(error){

console.error(
"UPDATE STRATEGY ERROR",
error
);

return null;

}


return data;


}







const {

data,

error

}

=

await supabase

.from(
"ai_learning_strategies"
)

.insert({

strategy_name:

strategyName,


condition,


recommendation,


success_count:

successCount,


failed_count:

failedCount,


success_rate:

successRate


})

.select()

.single();





if(error){

console.error(
"SAVE STRATEGY ERROR",
error
);

return null;

}



return data;


}