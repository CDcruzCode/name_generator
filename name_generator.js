class Name_Generator {
  static #VOWELS = ["a","e","i","o","u"];
  static #VOWEL_WEIGHTS= [43,57,38,37,19];
  static #CONSONANTS = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"];
  static #CONSONANT_WEIGHTS= [11,23,17,9,13,15,1,6,28,15,34,16,1,35,31,35,4,7,1,8,1];
  static #STOPS = ["p","t","k","n","m","d"];

  #consonant_weights_mod;
  #vowel_weights_mod;

  #max_length = 5;

  constructor(max_length = 5) {
    if(max_length == 0) {
      console.warn(`Cannot set name max length as 0. Used default ${this.#max_length}.`);
    } else {
      this.#max_length = Math.abs(max_length);
    }

    this.consonant_weights_mod = [...Name_Generator.#CONSONANT_WEIGHTS];
    this.vowel_weights_mod = [...Name_Generator.#VOWEL_WEIGHTS];
  }


  static #rand_int(min=0, max=10) {
    return Math.floor((Math.random() * max) + min);
  }


  static #get_weighted_probability(options, weights) {
  	//Input an array of options and corresponding weights
  	//and output a random option taking into account the weights of each option.
    let options_clone = [...options];
    let weights_clone = [...weights];
    if(options_clone.length != weights_clone.length) {
      throw new Error("options_clone array and weights_clone array must be of equal lengths");
    }

  	//let weights_cloneArr= (int[])weights_clone.Clone();
  	let total_probability = 0;

  	for(let i = 0; i < weights_clone.length; i++) {
  	  total_probability += weights_clone[i];
  	}

  	let chosen_option_int = this.#rand_int(0, total_probability);
  	let cumulative_probability = 0;

  	for(let a = 0; a < weights_clone.length; a++) {
  	  cumulative_probability += weights_clone[a];
  	  weights_clone[a]= cumulative_probability;

  	  if(weights_clone[a] > chosen_option_int) {
  		    return options_clone[a];
  	  } else if (chosen_option_int <= weights_clone[weights_clone.length -1]) {
  		    return options_clone[options_clone.length -1];
  	  }
  	}

	   throw new Error("[get_weighted_probability] Error unknown");
  }


  #modify_weights(previous_letter) {
    let current_weights;
    let letter_pos;
    if(Name_Generator.#CONSONANTS.includes(previous_letter)) {
      current_weights = this.consonant_weights_mod;
      letter_pos = Name_Generator.#CONSONANTS.indexOf(previous_letter);
    } else {
      current_weights = this.vowel_weights_mod;
      letter_pos = Name_Generator.#VOWELS.indexOf(previous_letter);
    }

    for (var i = 0; i < current_weights.length; i++) {
      if(i == letter_pos) {
        //Change chosen letters weight
        current_weights[letter_pos] -= 2;
        if(current_weights[letter_pos] < 1) {
          current_weights[letter_pos] = 1;
        }
      } else {
        //Change all other weights
        current_weights[i] += 1;
      }
    }
  }

 generate() {
     let it = 0;
     let name_string = "";

     let end_name = false;
     let is_diphthong = false;
     let is_coda = 0;


     while(!end_name) {

       //Adds a proceeding U to any name that currently has it's last letter as Q.
       if (it>1 && name_string[name_string.length-1] == 'q') {
         name_string += "u";
         end_name = false;
       }



      //FIRST LETTER
   	  if(it==1){
        if(Name_Generator.#rand_int() < 8) {
          name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
        } else {
          name_string += Name_Generator.#VOWELS[ Name_Generator.#rand_int(0, Name_Generator.#VOWELS.length-1) ];
        }
   	  }


      //SECOND LETTER
      if(it>=2) {
        if(Name_Generator.#VOWELS.includes(name_string[name_string.length-1])) {
          //First letter was a vowel
          if(Name_Generator.#rand_int(0,20) > 18) {
            //Second letter is a vowel. Make sure it works correctly
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
          } else {
            //Second letter is a consonant
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
          }
        } else {
          //First letter was a consonant
          if(Name_Generator.#rand_int(0,10) < 9) {
            //Second letter is a vowel. Make sure it works correctly
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
            //Because first letter was a consonant and second letter was a vowel. There is a small possibility that the name loop ends.
            if(Name_Generator.#rand_int(0,50) == 50) {
              //If true, end loop
              break;
            }
          } else {
            //Second letter is a consonant
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
          }
        }
      }



       //////////
       if(it>99) {
         console.warn("Name iteration surpassed 100 loops. Function exited.");
         break;
       }

       this.#modify_weights(name_string.slice(-1));
       it++;
    }
    //Name Loop Completed
    //Parse name and correct errors before returning string.

    return name_string;
  }
