import {
  findRecommendation
}
from "./ai.recommendation.repository";



export async function getAdaptiveRecommendation(
keyword:string = "latihan"
){



const pattern =

await findRecommendation({

rating:
"APPROVED",

keyword

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
pattern.success_rate,


patternId:
pattern.id



};



}