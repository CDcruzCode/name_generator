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




}





/*public string phonetic_name_generator(int max_length= 8)
{

	string[] vowels = {"a","a","a","a","e","e","e","e","e","i","i","i","o","o","u"};
	string[] vowelsArr= {"a","e","i","o","u"};
	int[] vowelWeights= {43,57,38,37,19};

	string[] consonantsArr= {"b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"};
	int[] consonantWeights= {11,23,17,9,13,15,1,6,28,15,34,16,1,39,31,35,4,7,1,8,1};

	string[] stops= {"p","t","k","n","m","d"};
	string[] invalidConsCombo= {
		"cp","gw","yk","fm","zr","wf","gd","vr","fg","vc",
		"fh","zg","vl","wr","cv","yr","cf","tc","dy","yd",
		"gd","wg","fw","gf","ct","gz","hf","rz","zr",
		"sg","mb","fb","bf","bg","gb","db","bd","cg","gc",
		"gl","lg","jf","fj","lr","lf","rl","hb","bh","wd",
		"dw","bt","tb","sb","sd","hk","rf","vw","dt","tf","dt"};
	string[] consCombo= {"ch","st","th","cl","gh","br","tr","sr","pr","dr","gr","pl"};
	string[] codaCombo= {
		"ap","ac","ak","ik","im","op","uk","el",
		"em","un","ex","et","at","ul","il","eh"};

	StringBuilder fullName= new StringBuilder();
	int it= 0;
	bool endName= false;
	bool isDiphthong= false;
	int isCoda= 0;
	int lengthProbability= Math.Abs(max_length);
	while (!endName) {
	  it++;
	  //fullName.ToString().print();
	  //Adds a proceeding U to any name that currently has it's last letter as Q.
	  if (it>1 && fullName[fullName.Length-1] == 'q') {
		fullName.Append("u");
		endName=false;
		continue;
	  }

	  //FIRST LETTER
	  if( it==1 ){
		fullName.Append( rand_int() < 8 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ] );
		continue;
	  }

	  //SECOND LETTER
	  if( it==2) {
  		if( vowelsArr.has_string(fullName[0]) ) { //If first letter is a vowel. Next letter is consonant.
  		  //####COULD CHANGE THIS TO ALLOW THE POSSIBILITY OF HAVING A NAME THAT STARTS WITH 2 VOWELS possibly Diphthong check.
		string v2 = get_weighted_probability(vowelsArr,vowelWeights);
		if( codaCombo.has_string(fullName[0]+v2)) {
		  fullName.Append(v2);
		  continue;
		}
  		  fullName.Append(get_weighted_probability(consonantsArr,consonantWeights));
  		  continue;
  		} else if (rand_int()<9) { //If 1st letter is a consonant, 2nd Letter is more likely to be a vowel
  		  fullName.Append(get_weighted_probability(vowelsArr,vowelWeights));
  		  continue;
  		} else { //Else 2nd letter will be a consonant.
				  string l2;


			  l2= get_weighted_probability(consonantsArr,consonantWeights);
			  if (stops.has_string(l2)) {
				fullName.Append(get_weighted_probability(vowelsArr,vowelWeights));
			  } else {
				if( consCombo.has_string(fullName[fullName.Length-1]+l2) || !invalidConsCombo.has_string(fullName[fullName.Length-1]+l2) ) {
				  fullName.Append(l2);
				  continue;
				} else {
				  fullName.Append(get_weighted_probability(vowelsArr,vowelWeights) + l2);
				  continue;
				}
			  }
  		 /* //Keep looping until a valid consonant is found to be the second letter after the first letter is a consonant.
  			  for (int i = 0; i < 20; i++) {

	  				//After 10 tries, give up and pick a vowel instead.
	  				if(i>=19) {
	  				  fullName.Append(get_weighted_probability(vowelsArr,vowelWeights));
	  				  break;
	  				}

	  				l2= get_weighted_probability(consonantsArr,consonantWeights);
	  				//Check if l2 is a stop letter. Don't add to name.
	  				if( Array.Exists(stops, elm => elm == l2) ) {
	  				  continue;
	  				}
	  				//Check if l2 is apart of a consonant combo with the last letter. If it is, add to name. Exit loop.
	  				if( consCombo.has_string(fullName[fullName.Length-1]+l2) ) {
	  				  fullName.Append(l2);
	  				  break;
	  				}
	  				continue;
  			  }
  		  continue;
  		  }
	  }

	  //THIRD LETTER AND ABOVE
	  if( it>2 ) {
		//If last letter is currently a "Stop" letter. Either return the string or pass onto next if statement.
		if( it!=2 && stops.has_string(fullName[fullName.Length-1]) && rand_int()>9 ) {
		return fullName.ToString().Capitalize();
		}

		//Check if name should end due to length
		//Random possibility of name generation ending per each cycle after first 3 letters.
		if( it!=3 && it >= rand_int(4,max_length) || lengthProbability == 1) {
		  endName=true;
		  break;
		} else {
		  //Decrement lengthProbability to gradually approach the max length of the name specified by max_length variable
		  lengthProbability-= 1;
		}

		//If name has not ended, continue processing
		//If first 2 letters are currently both consonants, next letter is much more likely to be a vowel
		//UNLESS the consonant count is greater than 0
		if( it==3 && fullName.Length == 2 && consonantsArr.has_string(fullName[fullName.Length-2]) && consonantsArr.has_string(fullName[fullName.Length-1])   ) {
		  fullName.Append( rand_int() >9 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ] );
		  continue;
		}

		//Check if last 2 letters are vowels. Next letter is more likely a consonant
		if ( vowelsArr.has_string(fullName[fullName.Length-2]) && vowelsArr.has_string(fullName[fullName.Length-1]) ) {
		  //If the last 2 vowels are exactly the same, next letter is definetly a consonant.
		  if ( (fullName[fullName.Length-2]+fullName[fullName.Length-1]) == (fullName[fullName.Length-2]+fullName[fullName.Length-1]) ) {
			fullName.Append(get_weighted_probability(consonantsArr,consonantWeights));
			continue;
		  }
		  //Else
		  fullName.Append( rand_int() > 1 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ] );
		  continue;
		}

		//Check if the first generated onset is NOT an S. Then there can only be 1 consonant Next. Lower isCoda to 1.
		if( isCoda == 2 && fullName[fullName.Length-1] != 's') {
		  isCoda=1;
		}

		//////////////
		//If same letter is repeated twice at the end. Next letter will be opposite
		/* if ( (fullName[fullName.Length-2]+fullName[fullName.Length-1]) == (fullName[fullName.Length-2]+fullName[fullName.Length-1]) ) {
			  string dupL;
			  //If last letter is consonant. Next letter is very likely to be a vowel
			  if( consonantsArr.has_string(fullName[fullName.Length-1]) ) {
				//Keep looping until non-repeated letter is found
					while(true) {
					  dupL= rand_int(0,20) > 19 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ];

					  if(dupL == fullName[fullName.Length-1].ToString()) {
						//If same letter generated, repeat loop
						continue;
					  } else{
						//If mew letter found. Add to name.
						break;
					  }
					}
			  } else { //Else the last 2 letters were vowels. Next letter is more likely to be a consonant
					//Keep looping until non-repeated letter is found
					while(true) {
					  dupL= rand_int(0,20) < 19 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ];

					  if(dupL == fullName[fullName.Length-1].ToString()) {
						//If same letter generated, repeat loop
						continue;
					  } else{
						//If mew letter found. Add to name.
						break;
					  }
					}
			  }

		  //Add new chosen letter that is not the same as the previous letter.
		  fullName.Append( dupL );
		  continue;
		}
		///////////////////
	//If same letter is repeated twice at the end. Next letter will be opposite
	if ( (fullName[fullName.Length-2]+fullName[fullName.Length-1]) == (fullName[fullName.Length-2]+fullName[fullName.Length-1]) ) {
	  string dupL;
	  if(consonantsArr.has_string(fullName[fullName.Length-1])) {
		while(true) {
		  dupL= rand_int(0,20) > 17 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ];
		  if(dupL==fullName[fullName.Length-1].ToString()){
			//Generated letter is the same as the last letter. So keep looping.
			continue;
		  } else {
			break;
		  }
		}


	  } else { //Next letter is a consonant
		while(true) {
		  dupL= rand_int(0,20) < 16 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ];
		  if(dupL==fullName[fullName.Length-1].ToString()){
			//Generated letter is the same as the last letter. So keep looping.
			continue;
		  } else {
			break;
		  }
		}
	  }

	  fullName.Append(dupL);
	  continue;
	}

		//Check if last 2 letters are a vowel followed by a consonant.
		if( vowelsArr.has_string(fullName[fullName.Length-2]) && consonantsArr.has_string(fullName[fullName.Length-1]) ) {
		  //If last 2 letters are a codaCombo. Set isCoda to 3.
		  if ( codaCombo.has_string(fullName[fullName.Length-2]+fullName[fullName.Length-1]) ) {
			  isCoda=3;
			} else {
			  isCoda=0;
			}

				//Choose if next letter should be vowel or conson . Because there was a coda previously.
				if (rand_int()>3) {
				  //If conson, check if it will work with previous conson
				  string nextL;
				  for (int i = 0; i < 20; i++) {

						  nextL= get_weighted_probability(consonantsArr,consonantWeights);

						  if( consCombo.has_string(fullName[fullName.Length-1]+nextL) ||  !invalidConsCombo.has_string(fullName[fullName.Length-1]+nextL) ) {
							//Valid consonant, so break and add to name before continuing loop.
							fullName.Append(nextL);
							break;
						  }

						  //After 10 tries, give up and pick a vowel to insert between the consonants.
						  if(i==19) {
							fullName.Append(get_weighted_probability(vowelsArr,vowelWeights));
							break;
						  }
					}

				  continue;

				} else {
				  fullName.Append(vowels[ rand_int(0,vowels.Length-1) ]);
				  isCoda=2;
				  continue;
				}
		  }

		//If there was a coda for the last vowel.
		if(isCoda>0) {
		  if( isCoda==1 && rand_bool()) {
			fullName.Append(get_weighted_probability(consonantsArr,consonantWeights));
		  } else {
			fullName.Append( rand_int() > 1 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ] );
		  }
		  isCoda=1;
		  continue;
		} else {
		  fullName.Append( rand_int(0,20) > 19 ? get_weighted_probability(consonantsArr,consonantWeights) : vowels[ rand_int(0,vowels.Length-1) ] );
		  continue;
		}

	  }

	}


  //This loop checks through the whole name.
  //It searches ot see if there are any invalid consonant combinations and adds a vowel inbetween the consonants to make it pronouncable.
  for (int i = 0; i < fullName.Length; i++) {
	char l1 = fullName[fullName.Length-1];
	char l2 = fullName[fullName.Length-2];

		if( consonantsArr.has_string(l1) && consonantsArr.has_string(l2) ){
			if(invalidConsCombo.has_string(l2+l1)) {
			  fullName.Insert(i, get_weighted_probability(vowelsArr,vowelWeights));
			}
		}
  }


	if( fullName[fullName.Length-2] == 'q') {
	  fullName.Remove(fullName.Length-1,1); //Removes the letter U from the end when QU is at the end.
	}

	return fullName.ToString().Capitalize();
  }


}
*/
