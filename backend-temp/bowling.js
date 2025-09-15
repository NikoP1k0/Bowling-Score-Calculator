function simulateGame(){
    let rolls = [];
    let frames = [];

    for(let frame = 0; frame < 10; frame++){
        
        if(frame < 9){
            // frames 1-9
            let first = Math.floor(Math.random() * 11);
            let second = first === 10 ? 0 : Math.floor(Math.random() * (11 - first));
            rolls.push(first, second);
            if(first < 10) rolls.push(second);
        } else {
            // 10th frame special case
            let first = Math.floor(Math.random() * 11);
            let second = Math.floor(Math.random() * (11 - (first == 10 ? 0 : first)));
            rolls.push(first, second);

            // extra roll if strike or spare
            if(first === 10 || first + second === 10){
                rolls.push(Math.floor(Math.random() * 11));
            }
        }
    }
    return rolls;
}

function calculateScore(rolls){
    let score = 0;
    let rollIndex = 0;

    for(let frame = 0; frame < 10; frame++){
        if(rolls[rollIndex] === 10){ 
            // strike
            score += 10 + rolls[rollIndex + 1] + rolls[rollIndex + 2];
            rollIndex += 1;
        } else if(rolls[rollIndex] + rolls[rollIndex + 1] === 10){
            // spare
            score += 10 + rolls[rollIndex + 2];
            rollIndex += 2;
        } else {
            // open frame
            score += rolls[rollIndex] + rolls[rollIndex + 1];
            rollIndex += 2;
        }
    }
    return score;
}

module.exports = { simulateGame, calculateScore };