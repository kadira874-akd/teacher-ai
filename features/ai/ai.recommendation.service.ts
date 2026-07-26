import {
findRecommendation
}
from "./ai.recommendation.repository";



export async function getAdaptiveRecommendation(){



const pattern =

await findRecommendation({

rating:
"APPROVED",

keyword:
"latihan"

});



if(!pattern){


return {

recommendation:
"Belum ada pola pembelajaran."

};


}



return {


recommendation:
pattern.recommendation,


confidence:
pattern.success_rate


};



}