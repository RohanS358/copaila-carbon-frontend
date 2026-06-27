import cat    from '../assets/cat.png'
import dog    from '../assets/dog.png'
import penguin from '../assets/penguin.png'
import panda  from '../assets/panda.png'
import rabbit from '../assets/rabbit.png'
import giraffe from '../assets/giraffe.png'
import pandaE1 from '../assets/pandaevolution1.png'
import pandaE2 from '../assets/pandaevolution2.png'
import pandaE3 from '../assets/pandaevolution3.png'
import penguinE1 from '../assets/penguinevolution1.png'
import penguinE2 from '../assets/penguinevolution2.png'
import penguinE3 from '../assets/penguinevolution3.png'

export const petImg = { cat, dog, penguin, panda, rabbit, giraffe }

export const evolutionImgs = {
  cat:     [cat,      cat,      cat],
  dog:     [dog,      dog,      dog],
  penguin: [penguinE1, penguinE2, penguinE3],
  panda:   [pandaE1,  pandaE2,  pandaE3],
  rabbit:  [rabbit,   rabbit,   rabbit],
  giraffe: [giraffe,  giraffe,  giraffe],
}
