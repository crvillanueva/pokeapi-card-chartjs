const form = document.querySelector("form");
const inputField = document.querySelector("input");
const ulsuggestions = document.querySelector("ul");
const card = document.querySelector(".card");

const cardpokeName = document.querySelector(".pokeName");
const cardHP = document.querySelector(".pokeHP");
const cardImg = document.querySelector(".card-img");
const cardAbilities = document.querySelector(".lista-habilidades");
const cardTypes = document.querySelector(".tipos");

const fetchPokemonNames = async (limit = 151) => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/?limit=${limit}`
  );
  const rjson = await response.json();
  const pokemonArray = rjson.results;

  let pokemonNames = [];
  pokemonArray.forEach((pokemon) => pokemonNames.push(pokemon.name));

  return pokemonNames;
};

const fetchPokemonJSON = async (pokemonName) => {
  console.log(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  if (response.status != 200) {
      throw new Error("Can't fetch this pokemon, check the name or try again");
  }
  const rjson = await response.json();
  console.log("Pokemon JSON object: ", rjson);

  return rjson;
};

const getPokemonProperty = (PokemonJSON, property) => {
  let pokemonProperty;
  switch (property) {
    case "img":
      pokemonProperty = PokemonJSON.sprites.other.dream_world.front_default;
      break;
    case "abilities":
      pokemonProperty = PokemonJSON.abilities;
      break;
    case "hp":
      pokemonProperty = PokemonJSON.stats[0].base_stat;
      break;
    case "stats":
      pokemonProperty = {
        HP: PokemonJSON.stats[0].base_stat,
        ATK: PokemonJSON.stats[1].base_stat,
        DEF: PokemonJSON.stats[2].base_stat,
        SP_ATK: PokemonJSON.stats[3].base_stat,
        SP_DEF: PokemonJSON.stats[4].base_stat,
        SPEED: PokemonJSON.stats[5].base_stat,
      };
      break;
    default:
      pokemonProperty = PokemonJSON[property];
  }

  return pokemonProperty;
};

const refreshCardHTML = (pokeName, pokemonHP, imgSource, types, abilities) => {
  cardAbilities.innerHTML = "";
  cardTypes.innerHTML = "";

  cardpokeName.innerText = pokeName;
  cardHP.innerText = `${pokemonHP} HP`;
  cardImg.src = imgSource;
  card.style.backgroundColor = `var(--${types[0].type.name}-l)`;
  abilities.forEach((ability) => {
    const abilityName = ability.ability.name;
    cardAbilities.innerHTML += `<li>${abilityName}</li>`;
  });
  types.forEach((type) => {
    const typeName = type.type.name;
    cardTypes.innerHTML += `<div style="background-color:var(--${typeName})" class="tipo">${typeName}</div>`;
  });
};

const firstMatches = (array, query, limit = 5) => {
  const filteredArray = array.filter((item) => item.includes(query));
  const firstItems = filteredArray.slice(0, limit);

  return firstItems;
};

const showSuggestions = (input, ul, array, max = 5) => {
  input.addEventListener("keyup", (e) => {
    ul.innerHTML = "";
    let inputValue = e.target.value.toLowerCase();
    let matches = firstMatches(array, inputValue, max);
    inputValue &&
      matches.forEach((match) => {
        ul.innerHTML += `<li>${match}</li>`;
      });
  });
};

const submitFormWithSuggestion = (suggestions, inputField) => {
  suggestions.addEventListener("click", (e) => {
    const parentForm = inputField.parentElement;
    inputField.value = e.target.innerText;
    parentForm.dispatchEvent(new Event("submit"));

    inputField.value = "";
    suggestions.innerText = "";
    parentForm.focus();
  });
};

fetchPokemonNames()
  .then((pokeNamesArray) => {
    showSuggestions(inputField, ulsuggestions, pokeNamesArray);
    submitFormWithSuggestion(ulsuggestions, inputField);
  })
  .catch((error) => {
    console.log(error);
  });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let pokemonUserQuery = inputField.value.toLowerCase();
  try {
    const pokemonObject = await fetchPokemonJSON(pokemonUserQuery);
    const pokemonHP = getPokemonProperty(pokemonObject, "hp");
    const imgSource = getPokemonProperty(pokemonObject, "img");
    const types = getPokemonProperty(pokemonObject, "types");
    const abilities = getPokemonProperty(pokemonObject, "abilities");
    const stats = getPokemonProperty(pokemonObject, "stats");
  
    const typeHexColor = getComputedStyle(card).getPropertyValue(`--${types[0].type.name}-l`);
    const typeColorD = getComputedStyle(card).getPropertyValue(`--${types[0].type.name}`);
  
    refreshCardHTML(pokemonUserQuery, pokemonHP, imgSource, types, abilities);
  
    document.querySelector("#stats-chart").remove();
    document.querySelector(".chart").innerHTML += `<canvas id="stats-chart"></canvas>`;
    makeStatsChart(stats, pokemonUserQuery, typeHexColor, typeColorD);

    inputField.classList.remove('input-error');
    inputField.value = "";
    ulsuggestions.innerText = "";
  } catch (error) {
    console.log(error);
      inputField.classList.add('input-error');
  }
});

//Stats chart
const makeStatsChart = (
  { HP, ATK, DEF, SP_ATK, SP_DEF, SPEED }, pokemonName, color, colorD) => {
  const context = document.getElementById("stats-chart").getContext("2d");
  const stats = [HP, ATK, DEF, SP_ATK, SP_DEF, SPEED];

  chart = new Chart(context, {
    type: "radar",
    data: {
      labels: [
        "Health",
        "Attack",
        "Defense",
        ["Special", "Attack"],
        ["Special", "Defense"],
        "Speed",
      ],
      datasets: [
        {
          label: `${pokemonName}`,
          data: stats,
          fill: true,
          backgroundColor: color,
          borderColor: colorD,
        },
      ],
    },
    options: {
      layout: {
        padding: 20,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        r: {
          pointLabels: {
            font: {
              size:13,
            }
          },
          suggestedMin: 0,
          suggestedMax: 150,
          grid: {
            color: "rgba(0, 0, 0, 0.2)",
          },
          angleLines: {
            color: "#eee",
          },
        },
      },
    },
  });
};

// default pikachu chart
makeStatsChart(
  {HP:35, ATK: 55, DEF: 40, SP_ATK:50, SP_DEF: 50, SPEED: 90},
  'Pikachu',
  'rgba(229, 197, 49, .25)',
  '#e5c531',
);