"use strict";
/*************************
 *  CACHED DOM ELEMENTS  *
 *************************/
const thoughtsElement = document.getElementById("thoughts");
const tpsElement = document.getElementById("tps");
const tpmElement = document.getElementById("tpm");
// New elements for Base TPS & Multiplier
const baseTpsElement = document.getElementById("base-tps");
const multiplierElement = document.getElementById("multiplier");

const thinkersContainer = document.getElementById("thinkers-container");
const paradigmsContainer = document.getElementById("paradigms-container");

// Pascal's Wager elements
const pascalWagerSectionContainer = document.getElementById("pascal-wager-section");
const pascalWagerSection = document.getElementById("pascal-wager");
const pascalWagerText = document.getElementById("pascal-wager-text");
const pascalDropdown = document.getElementById("pascal-thinker-dropdown");
const pascalWagerButton = document.getElementById("pascal-wager-btn");
const pascalFeedback = document.getElementById("pascal-wager-feedback");
// New elements for Level Up Pascal's Wager
const pascalLevelUpInstructions = document.getElementById("pascal-levelup-instructions");
const pascalLevelUpButton = document.getElementById("pascal-levelup-btn");

// Restart button element
const restartButton = document.getElementById("restart-btn");

/*************************
 *   BACKGROUND SETTINGS *
 *************************/
// Map each paradigm name to its corresponding background image.
const backgroundImages = {
    default: 'images/default-background.webp',
    "Animism": 'images/paradigm1-background.webp',
    "Mythic Tradition": 'images/paradigm2-background.webp',
    "Classical Philosophy": 'images/paradigm3-background.webp',
    "Scholasticism": 'images/paradigm4-background.webp',
    "Renaissance Humanism": 'images/paradigm5-background.webp',
    "Enlightenment Rationalism": 'images/paradigm6-background.webp',
    "Modernism": 'images/paradigm7-background.webp',
    "Existentialism": 'images/paradigm8-background.webp',
    "Postmodernism": 'images/paradigm9-background.webp',
    "Computationalism": 'images/paradigm10-background.webp',
    "Quantum Philosophy": 'images/paradigm11-background.webp',
    "Post-Scarcity Utopianism": 'images/paradigm12-background.webp',
    "Cosmic Pantheism": 'images/paradigm13-background.webp'
};

/**
 * Updates the background image based on purchased paradigms.
 */
function updateBackground() {
    let highestPurchasedIndex = -1;
    for (let i = 0; i < paradigms.length; i++) {
        if (paradigms[i].purchased) {
            highestPurchasedIndex = i;
        }
    }
    let backgroundUrl;
    if (highestPurchasedIndex >= 0) {
        const paradigmName = paradigms[highestPurchasedIndex].name;
        backgroundUrl = backgroundImages[paradigmName] || backgroundImages.default;
    } else {
        backgroundUrl = backgroundImages.default;
    }
    console.log("Setting background to:", backgroundUrl);
    document.body.style.backgroundImage = `url(${backgroundUrl})`;
}

/*************************
 *       GAME STATE      *
 *************************/
let thoughts = 0;
let displayedThoughts = 0;
let fractionalThoughts = 0;
let lastFrameTime = 0;
let lastUIUpdate = 0;

/**
 * Tracks whether Pascal's Wager (the ability to wager) is unlocked.
 * It unlocks when the first Storyteller (id === 1) is purchased.
 */
let pascalWagerUnlocked = false;
/**
 * Tracks whether the Level Up feature for Pascal's Wager is unlocked.
 * It unlocks when the first Priest (id === 2) is purchased.
 */
let pascalLevelUpUnlocked = false;

/**
 * Pascal's Wager win chance and upgrade level.
 * Base win chance is 50%. Each upgrade increases by 1%.
 */
let pascalWagerLevel = 0; // 0 means 50%, 1 means 51%, etc.
function getPascalWinChance() {
    return 0.50 + 0.01 * pascalWagerLevel;
}

/**
 * Array of upgrade costs for each 1% increase.
 * There are 15 values, corresponding to upgrades from 50% up to 65%.
 */
const pascalUpgradeCosts = [
    900, 4650, 24000, 123750, 637500,
    2625000, 13500000, 69375000, 427500000, 2925000000,
    6370000000, 13800000000, 30000000000, 307500000000, 3150000000000
];

/*************************
 *   THINKERS & PARADIGMS
 *************************/
const thinkers = [
    { id: 0, name: 'Curious Man', count: 1, baseCost: 10, costScaling: 1.8, baseTPS: 1, unlocked: true },
    { id: 1, name: 'Storyteller', count: 0, baseCost: 150, costScaling: 1.9, baseTPS: 2, unlocked: false },
    { id: 2, name: 'Priest', count: 0, baseCost: 600, costScaling: 2.0, baseTPS: 4, unlocked: false },
    { id: 3, name: 'Philosopher', count: 0, baseCost: 3000, costScaling: 2.1, baseTPS: 8, unlocked: false },
    { id: 4, name: 'Alchemist', count: 0, baseCost: 15000, costScaling: 2.2, baseTPS: 16, unlocked: false },
    { id: 5, name: 'Scientist', count: 0, baseCost: 75000, costScaling: 2.3, baseTPS: 32, unlocked: false },
    { id: 6, name: 'Enlightenment Thinker', count: 0, baseCost: 375000, costScaling: 2.4, baseTPS: 64, unlocked: false },
    { id: 7, name: 'Academic', count: 0, baseCost: 1.5e6, costScaling: 2.5, baseTPS: 128, unlocked: false },
    { id: 8, name: 'Psychologist', count: 0, baseCost: 7.5e6, costScaling: 2.6, baseTPS: 256, unlocked: false },
    { id: 9, name: 'Computer Scientist', count: 0, baseCost: 3.75e7, costScaling: 2.7, baseTPS: 512, unlocked: false },
    { id: 10, name: 'AI Researcher', count: 0, baseCost: 2.25e8, costScaling: 2.8, baseTPS: 1024, unlocked: false },
    { id: 11, name: 'Quantum Thinker', count: 0, baseCost: 1.5e9, costScaling: 2.9, baseTPS: 2048, unlocked: false },
    { id: 12, name: 'Posthuman', count: 0, baseCost: 1.5e10, costScaling: 3.0, baseTPS: 4096, unlocked: false },
    { id: 13, name: 'Galactic Philosopher', count: 0, baseCost: 1.5e11, costScaling: 3.1, baseTPS: 8192, unlocked: false },
    { id: 14, name: 'Cosmic Deity', count: 0, baseCost: 1.5e12, costScaling: 3.2, baseTPS: 16384, unlocked: false }
];

const paradigms = [
    { name: 'Animism', cost: 5000, multiplier: 1.5, purchased: false },
    { name: 'Mythic Tradition', cost: 50000, multiplier: 1.5, purchased: false },
    { name: 'Classical Philosophy', cost: 5e5, multiplier: 1.5, purchased: false },
    { name: 'Scholasticism', cost: 5e6, multiplier: 1.5, purchased: false },
    { name: 'Renaissance Humanism', cost: 5e7, multiplier: 2, purchased: false },
    { name: 'Enlightenment Rationalism', cost: 5e8, multiplier: 2, purchased: false },
    { name: 'Modernism', cost: 5e9, multiplier: 2, purchased: false },
    { name: 'Existentialism', cost: 5e10, multiplier: 2.5, purchased: false },
    { name: 'Postmodernism', cost: 5e11, multiplier: 2.5, purchased: false },
    { name: 'Computationalism', cost: 5e12, multiplier: 3, purchased: false },
    { name: 'Quantum Philosophy', cost: 5e13, multiplier: 3, purchased: false },
    { name: 'Post-Scarcity Utopianism', cost: 5e14, multiplier: 4, purchased: false },
    { name: 'Cosmic Pantheism', cost: 5e15, multiplier: 5, purchased: false }
];

/*************************
 *   SAVE & LOAD LOGIC   *
 *************************/
function saveGame() {
    const save = {
        thoughts: thoughts,
        fractionalThoughts: fractionalThoughts,
        pascalWagerUnlocked: pascalWagerUnlocked,
        pascalLevelUpUnlocked: pascalLevelUpUnlocked,
        pascalWagerLevel: pascalWagerLevel,
        thinkers: thinkers.map(t => ({
            id: t.id,
            count: t.count,
            unlocked: t.unlocked
        })),
        paradigms: paradigms.map(p => ({
            name: p.name,
            purchased: p.purchased
        }))
    };
    localStorage.setItem('philosophyIncrementalSave', JSON.stringify(save));
}

function loadGame() {
    const savedGame = localStorage.getItem('philosophyIncrementalSave');
    if (savedGame) {
        const save = JSON.parse(savedGame);
        thoughts = save.thoughts || 0;
        fractionalThoughts = save.fractionalThoughts || 0;
        pascalWagerUnlocked = save.pascalWagerUnlocked || false;
        pascalLevelUpUnlocked = save.pascalLevelUpUnlocked || false;
        pascalWagerLevel = save.pascalWagerLevel || 0;
        
        if (save.thinkers) {
            save.thinkers.forEach(savedThinker => {
                const thinker = thinkers.find(t => t.id === savedThinker.id);
                if (thinker) {
                    thinker.count = savedThinker.count;
                    thinker.unlocked = savedThinker.unlocked;
                }
            });
        }
        if (save.paradigms) {
            save.paradigms.forEach(savedParadigm => {
                const paradigm = paradigms.find(p => p.name === savedParadigm.name);
                if (paradigm) {
                    paradigm.purchased = savedParadigm.purchased;
                }
            });
        }
    }
}

/*************************
 *   UNLOCK INITIALIZATION
 *************************/
/**
 * Marks thinkers as unlocked if count > 0 and unlocks the next thinker.
 * Additionally:
 *  - If a Storyteller (id === 1) is purchased, unlock Pascal's Wager (i.e. wagering becomes available).
 *  - If a Priest (id === 2) is purchased, unlock the Level Up Pascal's Wager feature.
 */
function initializeUnlockedThinkers() {
    for (let i = 0; i < thinkers.length; i++) {
        if (thinkers[i].count > 0) {
            thinkers[i].unlocked = true;
            const nextThinker = thinkers[i + 1];
            if (nextThinker) {
                nextThinker.unlocked = true;
            }
            if (thinkers[i].id === 1) {
                pascalWagerUnlocked = true;
            }
            if (thinkers[i].id === 2) {
                pascalLevelUpUnlocked = true;
            }
        }
    }
}

/*************************
 *     INITIAL SETUP     *
 *************************/
function initializeUI() {
    initializeUnlockedThinkers();

    // Create thinker buttons
    thinkers.forEach(thinker => {
        const button = document.createElement('button');
        button.className = 'thinker-btn';
        button.dataset.id = thinker.id;
        button.innerHTML = `
            ${thinker.name} (TPS: ${thinker.baseTPS})<br>
            Cost: <span class="cost">${formatNumber(thinker.baseCost)}</span><br>
            Owned: <span class="count">${thinker.count}</span>
        `;
        thinkersContainer.appendChild(button);
        if (!thinker.unlocked) {
            button.style.display = 'none';
        }
    });

    // Create paradigm buttons
    paradigms.forEach((paradigm, index) => {
        const button = document.createElement('button');
        button.className = 'paradigm-btn';
        button.dataset.name = paradigm.name;
        button.innerHTML = `
            ${paradigm.name}<br>
            ${formatNumber(paradigm.cost)} Thoughts<br>
            ${paradigm.multiplier}x Multiplier
        `;
        paradigmsContainer.appendChild(button);
        if (index >= 2) {
            button.style.display = 'none';
        }
    });

    // Set up event listeners
    thinkersContainer.addEventListener('click', handleThinkerPurchase);
    paradigmsContainer.addEventListener('click', handleParadigmPurchase);
    pascalWagerButton.addEventListener('click', handlePascalWager);
    pascalLevelUpButton.addEventListener('click', handlePascalLevelUp);
}

/*************************
 *       MAIN LOOP       *
 *************************/
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    const tps = calculateTPS();
    if (tps > 0) {
        const newThoughts = tps * deltaTime + fractionalThoughts;
        const integerPart = Math.floor(newThoughts);
        fractionalThoughts = newThoughts - integerPart;
        thoughts += integerPart;
        displayedThoughts = thoughts;
        thoughtsElement.textContent = formatNumber(displayedThoughts);
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

/*************************
 *       UPDATE UI       *
 *************************/
function updateUI() {
    const now = Date.now();
    const currentBaseTPS = calculateBaseTPS();
    const currentMultiplier = calculateMultiplier();
    const finalTPS = currentBaseTPS * currentMultiplier;
    if (now - lastUIUpdate > 100) {
        tpsElement.textContent = formatNumber(finalTPS);
        tpmElement.textContent = formatNumber(finalTPS * 60);
        baseTpsElement.textContent = formatNumber(currentBaseTPS);
        multiplierElement.textContent = formatMultiplier(currentMultiplier);
        lastUIUpdate = now;
    }
    thinkers.forEach(thinker => {
        const button = document.querySelector(`[data-id="${thinker.id}"]`);
        if (!button) return;
        button.style.display = thinker.unlocked ? 'block' : 'none';
        const cost = Math.floor(thinker.baseCost * Math.pow(thinker.costScaling, thinker.count));
        button.querySelector('.cost').textContent = formatNumber(cost);
        button.querySelector('.count').textContent = thinker.count;
        button.disabled = thoughts < cost;
    });
    paradigms.forEach((paradigm, index) => {
        const button = document.querySelector(`[data-name="${paradigm.name}"]`);
        if (!button) return;
        button.disabled = thoughts < paradigm.cost || paradigm.purchased;
        let isVisible = false;
        if (paradigm.purchased) {
            isVisible = false;
        } else {
            if (index < 2) {
                isVisible = true;
            } else {
                const prereqIndex = index === 2 ? 0 : index - 1;
                isVisible = paradigms[prereqIndex].purchased;
            }
        }
        button.style.display = isVisible ? 'block' : 'none';
    });
    pascalWagerSectionContainer.style.display = pascalWagerUnlocked ? 'block' : 'none';
    
    // Only update the dropdown if it's not currently focused.
    if (document.activeElement !== pascalDropdown) {
        updatePascalDropdown();
    }
    
    updateBackground();
    updatePascalWagerTextAndLevelUpUI();
}

/*************************
 *   PURCHASE HANDLERS   *
 *************************/
function handleThinkerPurchase(event) {
    const button = event.target.closest('.thinker-btn');
    if (!button) return;
    const thinker = thinkers.find(t => t.id == button.dataset.id);
    const cost = Math.floor(thinker.baseCost * Math.pow(thinker.costScaling, thinker.count));
    if (thoughts >= cost) {
        thoughts -= cost;
        thinker.count++;
        animateThoughtCounter();
        if (thinker.count === 1) {
            thinker.unlocked = true;
            const nextThinker = thinkers.find(t => t.id === thinker.id + 1);
            if (nextThinker) {
                nextThinker.unlocked = true;
            }
            // Unlock Pascal's Wager when Storyteller (id === 1) is purchased.
            if (thinker.id === 1) {
                pascalWagerUnlocked = true;
            }
            // Unlock Level Up Pascal's Wager when Priest (id === 2) is purchased.
            if (thinker.id === 2) {
                pascalLevelUpUnlocked = true;
            }
        }
    }
}

function handleParadigmPurchase(event) {
    const button = event.target.closest('.paradigm-btn');
    if (!button) return;
    const paradigm = paradigms.find(p => p.name === button.dataset.name);
    if (thoughts >= paradigm.cost && !paradigm.purchased) {
        thoughts -= paradigm.cost;
        paradigm.purchased = true;
        animateThoughtCounter();
    }
}

/*************************
 *   PASCAL'S WAGER LOGIC
 *************************/
function updatePascalDropdown() {
    const selectedValue = pascalDropdown.value;
    pascalDropdown.innerHTML = '';
    thinkers
        .filter(t => t.id !== 0 && t.count > 0)
        .forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = `${t.name} (Owned: ${t.count})`;
            pascalDropdown.appendChild(option);
        });
    if ([...pascalDropdown.options].some(opt => opt.value == selectedValue)) {
        pascalDropdown.value = selectedValue;
    }
}

function handlePascalWager() {
    const chosenId = parseInt(pascalDropdown.value);
    const thinker = thinkers.find(t => t.id === chosenId);
    if (!thinker) return;
    const winChance = getPascalWinChance();
    const roll = Math.random();
    if (roll < winChance) {
        const oldCount = thinker.count;
        thinker.count *= 2;
        pascalFeedback.textContent = `You won! Your ${thinker.name} doubled from ${oldCount} to ${thinker.count}.`;
        flashThinkerButton(thinker.id, true);
    } else {
        pascalFeedback.textContent = `You lost! All your ${thinker.name}s are gone.`;
        flashThinkerButton(thinker.id, false);
        thinker.count = 0;
    }
    updateUI();
}

/*************************
 *   LEVEL UP HANDLER    *
 *************************/
function handlePascalLevelUp() {
    if (pascalWagerLevel >= pascalUpgradeCosts.length) {
        pascalFeedback.textContent = "Maximum Pascal's Wager upgrade reached!";
        return;
    }
    const cost = pascalUpgradeCosts[pascalWagerLevel];
    if (thoughts >= cost) {
        thoughts -= cost;
        pascalWagerLevel++;
        pascalFeedback.textContent = `Pascal's Wager upgraded to ${Math.round(getPascalWinChance()*100)}%!`;
        updateUI();
    } else {
        pascalFeedback.textContent = `Not enough thoughts to upgrade Pascal's Wager (Cost: ${formatNumber(cost)}).`;
    }
}

/*************************
 *        ANIMATION      *
 *************************/
function animateThoughtCounter() {
    if (displayedThoughts !== thoughts) {
        const diff = thoughts - displayedThoughts;
        const step = Math.sign(diff) * Math.max(Math.ceil(Math.abs(diff) / 10), 1);
        displayedThoughts += step;
        thoughtsElement.textContent = formatNumber(displayedThoughts);
        if (displayedThoughts !== thoughts) {
            requestAnimationFrame(animateThoughtCounter);
        }
    }
}

function flashThinkerButton(thinkerId, isWin) {
    const button = document.querySelector(`[data-id="${thinkerId}"]`);
    if (!button) return;
    const className = isWin ? 'flash-win' : 'flash-lose';
    button.classList.add(className);
    setTimeout(() => {
        button.classList.remove(className);
    }, 1000);
}

/*************************
 *     UTILITY FUNCS     *
 *************************/
function calculateMultiplier() {
    let total = 0;
    for (let i = 0; i < paradigms.length; i++) {
        if (paradigms[i].purchased) {
            total += paradigms[i].multiplier;
        }
    }
    return total > 0 ? total : 1;
}

function calculateBaseTPS() {
    return thinkers.reduce((acc, t) => acc + (t.count * t.baseTPS), 0);
}

function calculateTPS() {
    return calculateBaseTPS() * calculateMultiplier();
}

function formatNumber(num) {
    if (num < 1000) {
        return Math.floor(num).toLocaleString();
    }
    const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
    let value = num;
    let step = 0;
    while (value >= 1000 && step < suffixes.length) {
        value /= 1000;
        step++;
    }
    return step === 0 ? Math.floor(value).toLocaleString() : value.toFixed(2) + suffixes[step - 1];
}

function formatMultiplier(num) {
    if (num < 1000) {
        return num.toFixed(2);
    } else {
        const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
        let value = num;
        let suffixIndex = -1;
        while (value >= 1000 && suffixIndex < suffixes.length - 1) {
            value /= 1000;
            suffixIndex++;
        }
        return suffixIndex === -1 ? num.toFixed(2) : `${value.toFixed(2)}${suffixes[suffixIndex]}`;
    }
}

/**
 * Updates the Pascal's Wager section text and Level Up UI.
 * For wagering, the text shows the current win chance.
 * For leveling up, above the level-up button an instruction is displayed,
 * and the button itself shows only the cost.
 */
function updatePascalWagerTextAndLevelUpUI() {
    // Update wagering text with current win chance.
    const currentChance = Math.round(getPascalWinChance() * 100);
    pascalWagerText.textContent = `Risk it all for a ${currentChance}% chance to double your thinkers!`;
    
    // Show level up instructions and button only if the Level Up feature is unlocked (i.e. after Priest is purchased)
    if (pascalLevelUpUnlocked && pascalWagerLevel < pascalUpgradeCosts.length) {
        pascalLevelUpInstructions.style.display = 'block';
        pascalLevelUpButton.style.display = 'inline-block';
        pascalLevelUpButton.textContent = `${formatNumber(pascalUpgradeCosts[pascalWagerLevel])}`;
    } else {
        pascalLevelUpInstructions.style.display = 'none';
        pascalLevelUpButton.style.display = 'none';
    }
}

/*************************
 *   RESTART HANDLER     *
 *************************/
restartButton.addEventListener("click", function() {
    const confirmRestart = confirm("Are you sure you want to restart? This will lose all progress.");
    if (confirmRestart) {
        localStorage.removeItem('philosophyIncrementalSave');
        window.removeEventListener('beforeunload', saveGame);
        location.reload();
    }
});

/*************************
 *    START THE GAME     *
 *************************/
loadGame();
initializeUI();
requestAnimationFrame(gameLoop);
setInterval(saveGame, 5000);
window.addEventListener('beforeunload', saveGame);
