export function evaluateFeedback(
feedback:any[]
){


const total =
feedback.length;


if(!total){

return null;

}



const accepted =
feedback.filter(

item =>
item.rating === "GOOD"

).length;



const successRate =
Math.round(
(accepted / total) * 100
);



return {

total,

accepted,

successRate

};


}