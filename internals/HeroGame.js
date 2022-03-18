/**************************************************************************
 * 
 *      Sad Combat Simulator 2022 
 *      Version 2.0.0
 *      Added: -Shield Mechanic In!
 * 
 **************************************************************************/

/********************************** 
 * 
 *  Class constructs
 * 
***********************************/
class Character{
    say = (text) => {screenText(`My name is ${this._name}. ${text}. I am not real.`)} 
    diceRoll = (die) => {return Math.ceil(Math.random() * die)}
    constructor(name){
        this._name = name,
        this._energy = 100,
        this._hp = 20
        this._critical = false;
    }
    set critical(crit) {
        this._critical = crit;
    }
    get critical() {
        return this._critical;
    }
    set name(name){
        this._name = name;
    }
    get name(){
        return this._name;
    }
    get energy(){
        return this._energy;
    }
    get hp(){
        return this._hp;
    }
    receiveDamage(damage){
        this._hp -= damage;
    }
    get health() {
        return this._healthkit;
    }
    useHealthKit() {
        this._healthkit -= 1;
        this._hp += this.diceRoll(7) + 8;
        if(this._hp > 20){
            this._hp = 20;
            screenText(`${this.name} cannot heal above 20HP!`)
        }
    }
}

class MainCharacter extends Character{
    constructor(name){
        super(name);
        this._healthkit = 3;
        this._shieldCharge = 3; 
    }
    meleeAttack(){
        this._energy += 7.5;
        if(this.diceRoll(10) > 3)
            return this.diceRoll(3);
        else
            return -1;
    }
    spell(){
        if(this._energy >= 33){
            this._energy -= 33;
            return this.diceRoll(4) + 2;
        }
        else{
            screenText("I don't have the energy cast magic");
            return -2;
        }
    }
}

class EnemyPlayer extends Character{
    
    constructor(name){
        super(name);
        this._healthkit = 2;
    }
    meleeAttack(){
        this._energy += this.diceRoll(10);
        if(this.diceRoll(100) > 5)
            return this.diceRoll(4);
        else
            return -2;
    }
    spell(){
        if(diceRoll(100) > 2){
            if(this._energy >= 33){
                this._energy -= 33;
                return this.diceRoll(5) + 3
            }
            else
                alert("This shouldn't appear");
            }
        else {
            return -2
        }
    }
    
}
/****************************************************
 * 
 *      Screen Message Setters
 * 
 *****************************************************/
 const screenText = (text) => {
    val("GameScreen").innerHTML += `${text}\n`
    val("Stats").innerHTML = `HP: ${Hero.hp} - Energy: ${Hero.energy} - MedKit: ${Hero.health}`
}
const clearScreen = () => {
    val("GameScreen").innerHTML = "";
}

/****************************************************
 * 
 *       Hero Event Methods
 * 
 *****************************************************/
let medKitRedeem = false;
let shieldReady = false;

const shieldCharge = () => {
    clearScreen();
    if(Hero._shieldCharge > 0){
        Hero._shieldCharge -= 1;
        shieldReady = true;
        screenText(`${Hero.name} readies themselves for the next hit!`);
        screenText(`${Hero._shieldCharge} durability on shield remaining`);
        enemyTurn();
    }
    else{
        screenText("The shield is broken, I cannot guard");
    }

}
receiveMedKit = () => {
    if(medKitRedeem){
        clearScreen();
        screenText("Medkit already Claimed");
    }
    else{
        clearScreen();
        Hero._healthkit += 2;
        val("")
        screenText("*** Medkit Redeemed ***");
        medKitRedeem = true;
        document.getElementById("freeKit").innerHTML = "2023";
    }
}
godModeActivate = () => {
    clearScreen();
    Hero._hp = 10000;
    Hero._energy = 10000;
    Hero._healthkit = 10000;
    Hero._critical = true;
    Hero._shieldCharge = 10000;
    screenText("***GODMODE ACTIVATED***");
}
const setHeroName = () => {
    startGame()
    clearScreen();
    const name = val("Name").value;
    Hero.name = name;
    screenText(`You are ${Hero.name} - Combat Veteran`);

}

const resolveCombat = (dmg) => {
    if(dmg >= 0){
        screenText(`${dmg} damage taken by ${Enemy.name}`);
        screenText("");
        Enemy.receiveDamage(dmg);
        screenText(`${Enemy.name} has ${Enemy.hp}HP remaining!`);
    }
    else if(dmg === -2){
        screenText(`The Attack Missed!`)
        screenText("");
    }
    else if(dmg === -1){
        screenText(`${Enemy.name} dodged the attack!!`)
        screenText("");
    }
    enemyTurn()
}

const heroAttackPhase = () => {
    clearScreen();
    if(Hero.diceRoll(100) > 95){
        Hero.critical = true;
        screenText("The Hero readies their attack");
    }
    const meleeVerb = ["slashes", "lunges", "stabs", "pokes", "jabs", "swings", ]
    screenText(`${Hero.name} ${meleeVerb[Hero.diceRoll(meleeVerb.length) - 1]} with their sword`)
    if(!Hero.critical){
        resolveCombat(Hero.meleeAttack())
    }
    else{
        screenText("");
        screenText("CRITICAL HIT!")
        screenText("");
        resolveCombat(Hero.meleeAttack() + 5)
        Hero.critical = false;
    }
}
const heroSpellPhase = () => {
    const heroSpells = ["Shock", "Magic Missile", "Genesis", "Fireball", "Meteor", "Ice Beam"]
    clearScreen();
    screenText(`${Hero.name} casts ${heroSpells[Hero.diceRoll(heroSpells.length) - 1]}`);
    resolveCombat(Hero.spell());
}

const healHP = () => {
    clearScreen();
    if(Hero.health > 0 && Hero.hp < 20){
        Hero.useHealthKit();
        screenText(`${Hero.name} healed, new HP ${Hero.hp}`);
        screenText(`HP Remaining: ${Hero.hp}`);
        screenText(`${Enemy.name} has ${Enemy.hp}HP remaining!`);
        enemyTurn();
    }
    else if(Hero.hp >= 20){
        screenText("Full HP, Cannot Heal")
    }
    else{
        screenText(`No Healthkits remaining. HP is ${Hero.hp}`);
    }
}
/****************************************************
 * 
 *  Enemy Logic - Permitting conditions Met, the enemy can Attack with Melee, Magic, Heal, or Idle
 * 
 *****************************************************/
const enemyTurn = () => {
    if(!Enemy.critical){
        if(Enemy.hp <= 0){
            enemyDefeated();
        }
        else if(Math.random() * 100 > 96){
            screenText(`${Enemy.name} is preparing something...`);
            Enemy.critical = true;
        }
        else if(Enemy.diceRoll(100) > 86){
            screenText(`${Enemy.name} is catching its breath...`)
        }
        else if(Enemy.hp < 10 && Enemy.health > 0){
            healEnemyHP();
        }
        else{
            const enemyRoll = Math.ceil(Math.random() * 20)
            if(enemyRoll % 2 === 0 && Enemy.energy >= 33){
                enemySpell(enemyRoll);
            }
            else
            EnemyAttackPhase(enemyRoll);
        }
    }
    else{
        enemyCrit();
    }
    if(Hero.hp <= 0)
        heroDefeated();
}

const healEnemyHP = () => {
    if(Enemy.health > 0){
        Enemy.useHealthKit();
        screenText(`${Enemy.name} healed, new HP ${Enemy.hp}`);
    }
}
const EnemyAttackPhase = () => {
    const bodyPart = ["Arms", "Face", "Legs", "Earlobe", "Groin"];
    const i = Math.floor(Math.random() * bodyPart.length);
    screenText(`${Enemy.name} slashes your ${bodyPart[i]}.`)
    resolveEnemyCombat(Enemy.meleeAttack())
}
const enemyCrit = () => {
    screenText(`${Enemy.name} goes for a critical hit`)
    resolveEnemyCombat(10);
    if(!shieldReady)
        screenText("Massive Damage!");
    Enemy.critical = false;

}
const enemySpell = () => {
    screenText(`${Enemy.name} casts Nail Rain`);
    resolveEnemyCombat(Enemy.diceRoll(5) + 4);
}

const resolveEnemyCombat = (dmg) => {
    if(shieldReady){
        if(dmg == 10){
            dmg = 5;
            screenText("You stagger at the mighty blow, \nbut brace your shield");
        }
        else if(dmg < 6)
            dmg = 1;
        else
            dmg = 3;   
    }
    if(dmg >= 0){
        Hero.receiveDamage(dmg);
        screenText(`${dmg} damage taken by ${Hero.name}`);
    }
    shieldReady = false;
}


/****************************************************
 * 
 *  Victory / Defeat
 * 
 *****************************************************/
const heroDefeated = () => {
    screenText(`Unfortunately ${Hero.name} has been defeated.`);
    screenText(`You won't be able to go any further`)
    screenText(`***** GAME OVER *****`)
    screenText("If only 2022 gave you more healthkits")
    endGame();
}

const enemyDefeated = () => {
    endGame();
    screenText("");
    screenText(`${Hero.name} has succeeded in combat against ${Enemy.name}`);
    screenText("***** Please play again! *****")
}

const endGame = () => {
    Atk.setAttribute("disabled", `true`);
    Spell.setAttribute("disabled", `true`);
    Heal.setAttribute("disabled", `true`);
    val("GodMode").setAttribute("disabled", `true`);
    val("Guard").setAttribute("disabled", `true`);
}
const startGame = () => {
    Atk.removeAttribute("disabled", `true`);
    Spell.removeAttribute("disabled", `true`);
    Heal.removeAttribute("disabled", `true`);
    val("GodMode").removeAttribute("disabled", `true`);
    val("Guard").removeAttribute("disabled", true);
}
/****************************************************
 * 
 *  Event Listeners // Game Character Tokens
 * 
 *****************************************************/
let restart = () => location.reload();
let val = (target) => document.getElementById(target);

const Atk = val("Attack");
const Spell = val("Spell");
const Heal = val("Heal");

let Hero = new MainCharacter("Nameless Hero");
let Enemy = new EnemyPlayer("Gremelkin");

document.getElementById("Guard").addEventListener("click", shieldCharge)
document.getElementById("freeKit").addEventListener("click", receiveMedKit);
document.getElementById("SetName").addEventListener("click", setHeroName);
document.getElementById("Attack").addEventListener("click", heroAttackPhase);
document.getElementById("Spell").addEventListener("click", heroSpellPhase);
document.getElementById("Heal").addEventListener("click", healHP);
document.getElementById("Restart").addEventListener("click", restart);
val("GodMode").addEventListener("click", godModeActivate)