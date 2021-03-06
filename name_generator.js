class Name_Generator {
  static #VOWELS = ["a","e","i","o","u"];
  static #VOWEL_WEIGHTS = [43,57,38,37,19];
  static #CONSONANTS = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"];
  static #CONSONANT_WEIGHTS_DIS = [11,23,17,9,13,15,1,6,28,15,34,16,1,35,31,35,4,7,1,8,1];
  static #CONSONANT_WEIGHTS = [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100];
  static #STOPS = ["p","t","k","n","m","d"];

  #consonant_weights_mod;
  #vowel_weights_mod;

  #max_length = 5;

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
      //Remove any options that have a probability of 0 or below.
      if(weights_clone[i]  <= 0) {
        weights_clone.splice(i, 1);
        options_clone.splice(i, 1);
        i--;
      } else {
        total_probability += weights_clone[i];
      }
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

  #manual_modify_weights(name, array, min, max) {
    let letter_pos;
    if(Name_Generator.#CONSONANTS.includes(name[name.length-1])) {
      letter_pos = Name_Generator.#CONSONANTS.indexOf(name[name.length-1]);
    } else {
      letter_pos = Name_Generator.#VOWELS.indexOf(name[name.length-1]);
    }

    for (var i = 0; i < array.length; i++) {
      if(i == letter_pos) {

      } else {
        //Change all other weights
        if(array[i] > 0) {
          array[i] += Name_Generator.#rand_int(min, max);
          if(array[i] < 1) {
            array[i] = 1;
          }
        }

      }
    }
  }

 generate(max_length = this.#max_length, language = "english") {
   //Set max length of name
     if(max_length == 0) {
       console.warn(`Cannot set name max length as 0. Used default ${this.#max_length}.`);
     } else {
       this.#max_length = Math.abs(max_length);
     }

     this.consonant_weights_mod = [...Name_Generator.#CONSONANT_WEIGHTS];
     this.vowel_weights_mod = [...Name_Generator.#VOWEL_WEIGHTS];

  //Set language
  language = language.toLowerCase();
  switch (language) {
    case "english": //English follows the constraints of 3 Consonants, 1 Vowel and 5 Consonants. CCCVCCCCC pattern. 5 Consonants is very unlikely though.
      break;
    case "romaji": //Japanese Romanji follows a CCV pattern with no coda. The only Coda allowed is a N.
      break;
    default:
      console.warn("Invalid language_type inputted, defaulting to english.");
      language = "english";
  }





     /////////////
     let name_string = ""
     if(language == "english") {
       name_string = this.#generate_english();
     }

    if(language == "romaji") {
      name_string = this.#generate_romaji(); //Japanese with english letters
    }
    //===NAME LOOP COMPLETED===/
    //Parse name and correct errors before returning string.

    //Checking if the name string has surpassed the length specified by max length.
    //If so, trim string to the right length if possible.
    if(name_string.length > this.#max_length) {
      name_string = name_string.substring(0, this.#max_length);
    }

    //If name ends in "QU" Remove U from the end because practially no words end in QU.
    if(name_string[name_string.length-2] + name_string[name_string.length-1] == "qu") {
      name_string = name_string.slice(0,-1);
    }


    return name_string;
  }



  #generate_english() {
    let it = 0;
    let length_probability = this.#max_length;
    let name_string = "";

    let end_name = false;
    let is_coda = false;
    let onset_length = 0;
    let coda_length = 0;
       while(!end_name) {

         let previous_letter = name_string[name_string.length-1];

         //Adds a proceeding U to any name that currently has it's last letter as Q.
         if (it>0 && previous_letter == 'q') {
           name_string += "u";
         }

         //////////
         if(it>99) {
           console.warn("Name iteration surpassed 100 loops. Function exited.");
           break;
         }

         this.#modify_weights(name_string.slice(-1));
         it++;

        //Check if name should end due to length
        //Random possibility of name generation ending per each cycle after first 3 letters.
        if(it >= Name_Generator.#rand_int(4,this.#max_length) || length_probability == 0) {
          break;
        } else {
          //Decrement lengthProbability to gradually approach the max length of the name specified by max_length variable
          length_probability -= 1;
        }

         //Reset probabilitys
         this.vowel_weights_mod = [...Name_Generator.#VOWEL_WEIGHTS];
         this.consonant_weights_mod = [...Name_Generator.#CONSONANT_WEIGHTS];

         //If coda count is greater than 4. Reset count and set Coda to false. This means the next letter must be a vowel or a consonat apart of the onset.
         if(is_coda && coda_length > 4) {
           is_coda = false;
           coda_length = 0;
           onset_length = 0;
         } else if(is_coda) {
           coda_length++;
         }
         //If Onset count is greater than 3. Reset count and next letter MUST BE a vowel.
         if(!is_coda && onset_length > 3) {
           is_coda = true;
           coda_length = 0;
           onset_length = 0;
           name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
           continue;
         } else if(!is_coda) {
           onset_length++;
         }


         //If previous letter is a STOP letter. set is_coda to false as the next letter should be a onset or vowel.
         if(Name_Generator.#STOPS.includes(previous_letter) && is_coda === true) {
           is_coda = false;
           onset_length = 0;
         }


         //Set weights for starting consonant to match most frequently used consonants.
         if( name_string == "" || Name_Generator.#VOWELS.includes(previous_letter) ) {
           this.consonant_weights_mod = [...Name_Generator.#CONSONANT_WEIGHTS_DIS];
         //} else if(is_coda) {
         } else {
         //===MODIFY WEIGHTS DEPENDANT ON PREVIOUS LETTER===//
         //These weights are modified preceding any changes from the algorithm
         //If is_coda==true use weights for coda consonants, else use weights for onset consonants.
           if(previous_letter == "b") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] += Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] += Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "c") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] += Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] += Name_Generator.#rand_int(1, 10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "d") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] += Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "f") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] += Name_Generator.#rand_int(8,80);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "g") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "h") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] -= Name_Generator.#rand_int(7,70);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] -= Name_Generator.#rand_int(5,50);
           }

           if(previous_letter == "j") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] -= Name_Generator.#rand_int(2,20);
           }

           if(previous_letter == "k") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] += Name_Generator.#rand_int(1,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] -= Name_Generator.#rand_int(8,80);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(8,80);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "l") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(8,80);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "m") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "n") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] -= Name_Generator.#rand_int(4,40);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "p") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] -= Name_Generator.#rand_int(4,40);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] -= Name_Generator.#rand_int(7,70);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] -= Name_Generator.#rand_int(4,40);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(7,70);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "q") {
             //THE LETTER Q IS ALWAYS FOLLOWED BY U. This has already been coded above. so this if block should never trigger.
             /*
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;*/
           }

           if(previous_letter == "r") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "s") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "t") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] += Name_Generator.#rand_int(4,40);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] += Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "v") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] - 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "w") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] - 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] += Name_Generator.#rand_int(2,20);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "x") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(4,40);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "y") {
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] -= Name_Generator.#rand_int(1,10);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] -= Name_Generator.#rand_int(5,50);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] -= Name_Generator.#rand_int(3,30);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] -= Name_Generator.#rand_int(6,60);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] -= Name_Generator.#rand_int(9,90);
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
           }

           if(previous_letter == "z") {
             /*
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("b")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("c")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("d")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("f")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("g")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("h")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("j")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("k")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("l")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("m")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("n")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("p")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("q")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("r")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("t")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("v")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("w")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("x")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("y")] = 0;
             this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("z")] = 0;
             */
             //No words have a Z followed by another consonant. So next letter MUST be a vowel.
             name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
             is_coda = true;
             coda_length = 0;
             continue;
           }
         }

         //If processing last letter. S is much more likely. Otherwise S is less likely.
         if(name_string.length == this.#max_length - 1) {
           this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] += Name_Generator.#rand_int(4,40);
         } else {
           this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf("s")] -= Name_Generator.#rand_int(5,50);
         }

         //console.log(this.consonant_weights_mod);

        //FIRST LETTER
        if(it==1){
          if(Name_Generator.#rand_int() < 8) {
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
          } else {
            name_string += Name_Generator.#VOWELS[ Name_Generator.#rand_int(0, Name_Generator.#VOWELS.length-1) ];
            is_coda = true;
            continue;
          }
        }


        //SECOND LETTER
        if(it==2) {
          if(Name_Generator.#VOWELS.includes(previous_letter)) {
            //First letter was a vowel
            if(Name_Generator.#rand_int(0,20) > 18) {
              //Second letter is a vowel
              //Increases probability of all other vowels instead of the previous vowel.
              this.vowel_weights_mod[Name_Generator.#VOWELS.indexOf(previous_letter)] = 1;
              this.#manual_modify_weights(previous_letter, this.vowel_weights_mod, 10, 100);
              name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
              is_coda = true;
              continue;
            } else {
              //Second letter is a consonant
              name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);

              if( Name_Generator.#STOPS.includes(previous_letter) && Name_Generator.#rand_int(0,40) == 40 ) {
                //If a consonant is chosen, check if it is apart of the STOPS array then give a small probability of the name loop ending.
                //This will create a 2 letter name with a Vowel then a Consonant
                break;
              }
              continue;
            }
          } else {
            //First letter was a consonant
            if(Name_Generator.#rand_int(0,10) < 9) {
              //Second letter is a vowel.
              name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
              is_coda = true;
              //Because first letter was a consonant and second letter was a vowel. There is a small possibility that the name loop ends.
              if(Name_Generator.#rand_int(0,50) == 50) {
                //If true, end loop
                break;
              }
              continue;
            } else {
              //Second letter is a consonant
              //Set previous letters probability to 1
              this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf(previous_letter)] = 1;
              //Increases probability of all other consonants instead of the previous consonant.
              this.#manual_modify_weights(previous_letter, this.consonant_weights_mod, 10, 100);
              name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
              continue;
            }
          }
        }
        //End of Second Letter

        //THIRD LETTER AND ABOVE
        if( it>2 ) {
          if( Name_Generator.#STOPS.includes(previous_letter) && Name_Generator.#rand_int(0,50) == 50 ) {
            //Check if last letter is apart of the STOPS array then give a small probability of the name loop ending.
            break;
          }

          //For the third letter. Check if first two letters are consonants. This means that the 3rd letter should most likely be a vowel.
          if(it==3 && Name_Generator.#CONSONANTS.includes(name_string[name_string.length-2]) && Name_Generator.#CONSONANTS.includes(previous_letter) ) {
            if(Name_Generator.#rand_int(0,15) > 14) {
              //Select consonant for the 3rd letter. But because first 2 letters are consonants as well. Modify weights.

              //Increases probability of all other consonants instead of the previous consonant.
              this.#manual_modify_weights(previous_letter, this.consonant_weights_mod, 20, 200);
              //Set previous letters probability to 0 because it is practically impossible to have a word with 3 of the same letter in a row.
              this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf(previous_letter)] = 0;
              name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
              continue;

            } else {
              //Set the 3rd letter as a vowel
              name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
              is_coda = true;
              continue;
            }
          }


          //FOURTH LETTER AND BEYOND
          //If Last 2 letters are vowels it's more likely to be a consonant
          if(Name_Generator.#VOWELS.includes(name_string[name_string.length-2]) && Name_Generator.#VOWELS.includes(previous_letter)) {
            //If last 2 vowels are both the same letter, the next letter must be a consonant.
            if(name_string[name_string.length-2] == previous_letter) {
              name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
              continue;
            } else {
              //Small chance that the next letter is a vowel. But more likely a consonant.
              if(Name_Generator.#rand_int(0,20) == 20) {
                name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
                is_coda = true;
                continue;
              } else {
                name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
                continue;
              }
            }
          }

          //If last 2 letters are exactly the same, reduce it's probability to 0. Then choose random vowel or consonant.
          if(name_string[name_string.length-2] == previous_letter) {
            if( Name_Generator.#VOWELS.includes(previous_letter) ) {
              this.vowel_weights_mod[Name_Generator.#VOWELS.indexOf(previous_letter)] = 0;
              continue;
            } else {
              this.consonant_weights_mod[Name_Generator.#CONSONANTS.indexOf(previous_letter)] = 0;
              continue;
            }
          }

          // A 50/50 change of the next letter being a vowel or consonant
          if(Name_Generator.#rand_int(1,(10 + (onset_length*2))) < 5) {
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
          } else {
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
            is_coda = true;
          }

        }
        //End of Third letter
      }

      return name_string;
    }



    //NEED TO INCLUDE ?? and ?? characters. 2 Vowels in a row are also allowed but very rare, for example yokai.
  #generate_romaji() {
      let it = 0;
      let length_probability = this.#max_length;
      let name_string = "";
      let end_name = false;

      while(!end_name) {
        //Adds a proceeding U to any name that currently has it's last letter as Q.
        if (it>1 && name_string[name_string.length-1] == 'q') {
          name_string += "u";
        }

        //////////
        if(it>99) {
          console.warn("Name iteration surpassed 100 loops. Function exited.");
          break;
        }

        this.#modify_weights(name_string.slice(-1));
        it++;

       //Check if name should end due to length
       //Random possibility of name generation ending per each cycle after first 3 letters.
       if( it >= Name_Generator.#rand_int(4,this.#max_length) || length_probability == 0) {
         //console.log(name_string);
         //If last letter is a consonant, chance of generating one last vowel if length is less than max_length
         if(Name_Generator.#CONSONANTS.includes(name_string[name_string.length-1]) && name_string.length != this.#max_length && Name_Generator.#rand_int()<4) {
           name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
         }

         //If the last 2 letters are consonants, remove them from the string
         if(Name_Generator.#CONSONANTS.includes(name_string[name_string.length-1])) {
           name_string = name_string.slice(0,-1);
         }
         if(Name_Generator.#CONSONANTS.includes(name_string[name_string.length-1])) {
           name_string = name_string.slice(0,-1);
         }

         //If last letter is a Vowel. Small change for the name to end with an N if name is not at max length.
         if(Name_Generator.#VOWELS.includes(name_string[name_string.length-1]) && name_string.length != this.#max_length && Name_Generator.#rand_int() > 6) {
           name_string += "n"
         }
         break;
       } else {
         //Decrement lengthProbability to gradually approach the max length of the name specified by max_length variable
         length_probability -= 1;
       }

        //Reset probabilities
        this.vowel_weights_mod = [...Name_Generator.#VOWEL_WEIGHTS];
        this.consonant_weights_mod = [100,50,70,80,60,40,40,50,20,50,60,20,0,50,70,70,0,30,0,40,0];

        //static #CONSONANTS = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"];
        //static #CONSONANT_WEIGHTS_DIS = [100,50,70,80,60,40,40,50,20,50,60,30,0,50,70,70,0,30,10,40,0];


        //FIRST LETTER
        if(it==1) {
          if(Name_Generator.#rand_int() > 7) {
            //Vowel less likely to start
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
          } else {
            //Consonant more likely to be first letter
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
          }
        }

        //SECOND LETTER AND BEYOND
        if(it>=2) {
          if(it>2 && Name_Generator.#CONSONANTS.includes(name_string[name_string.length-2]) && Name_Generator.#CONSONANTS.includes(name_string[name_string.length-1]) ) {
            //If last 2 letters were consonants, next letter is definetly a vowel.
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
            continue;
          }

          if(Name_Generator.#VOWELS.includes(name_string[name_string.length-1])) {
            //If last letter was a vowel, next letter must be a consonant
            name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
          } else {
            //If last letter was a consonant, small chance of another consonant
            if(Name_Generator.#rand_int() > 2) {
              //Vowel more likely to be next letter
              let chosen_vowel = Name_Generator.#get_weighted_probability(Name_Generator.#VOWELS, this.vowel_weights_mod);
              if(chosen_vowel == "o" && Name_Generator.#rand_int() > 8) {
                chosen_vowel = "??";
              }
              if(chosen_vowel == "e" && Name_Generator.#rand_int() > 8) {
                chosen_vowel = "??";
              }
              name_string += chosen_vowel;
            } else {
              //Consonant less likely to be next letter
              if(name_string[name_string.length-1] == "c") {
                //If last letter was a C, then next letter must be a H
                name_string += "h";
                continue;
              }

              if(name_string[name_string.length-1] == "s" && Name_Generator.#rand_int() > 3) {
                //If last letter was a S, then change for next letter to be H
                name_string += "h";
                continue;
              }

              //name_string += Name_Generator.#get_weighted_probability(Name_Generator.#CONSONANTS, this.consonant_weights_mod);
            }
          }
        }

      }


      return name_string;
    }
}
