# robeProgress
Animation of balloon dragging a robe whose ends are fixed.
[Quick demo](https://mycolaanikeiev.github.io/robe_progress/)

## Simple usage
Just instatiate **Robe** class and provide canvas element to its constructor. Keep in mind that **canvas** element should also have `width` and `height` attributes specified. Try to find sizes that works for you. 

    let robe = new Robe({canvas})
    
Next to indicate progress, call method which take as parameter range between 0-1.0

    robe.setProgress(0.05)  // 5%
    
Also if you done, call

    robe.stop()
    
method, otherwise there will be memory lickage.

## Lastly
It's source code is only two handred lines long, so feel free to modify and play with it as you wish. 
