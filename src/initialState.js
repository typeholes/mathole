
//zig zag to sin
// f(x) = 1-2 * arccos((1-z) * sin(2 * pi * x))/pi

// square wave to sin
//g(x)=2 * arctan( sin(2 * pi * x)/z)/pi

// sawtooth to flat
//h(x) = (1+f((2 * x - 1)/4) * g(x/2))/2

// ceil to diagonal
//x-h(x)

// no clue what to call this
//j(a,b)=\log(a^{2}+b^{2})

// curved sawtooth to log
//j(x^z,h(x))