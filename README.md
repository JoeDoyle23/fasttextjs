# fasttextJS

A JavaScript implementation of the FastText prediction algorithm

The goal is to provide a compatible `predict` and `predict-prob` with the C++
version of FastText for use in Node.js.

## FastText

[FastText](https://fasttext.cc/) is a project out of Facebook Research. The primary
implementation can be found at [https://github.com/facebookresearch/fastText](https://github.com/facebookresearch/fastText). That is the source code used to create
this version.

## Purpose of this code

This code is an experiment to see how fast a pure JavaScript implimentation could be.
I envision that a modified version of the original C++ compliled to WebAssembly will
be the most performant while having the best interoperability with Node.js.

The original FastText C++ version allows for both the creation of the model via training,
as well as the ability to use that model for predictions. This implimentaion is currently
only focused on the prediction side of FastText. With that in mind, it is compatible with
models generated by the C++ version.

As much as I love Node and JavaScript, I don't see much value in implimenting the training
code as the original is multithreaded and the performance will never be matched.

## Status

Initial testing with our pretrained models is showing results that are very close to the
C++ version. I'm still working through the code to see if I missed something in the
port.

I also haven't started preformance tuning the code yet. There are many places for
optimizations and doing things the JavaScript way instead of the C++ way.

This is still in progress, but I'd be curious to hear of other's experiences with it.

## Limitations

Several of the values stored in the model file are 64-bit integers, so JavaScript limits
apply (max values of 2^53 - 1). Models that are larger than that will probably fail to
work correctly.

Currently this code only loads the "compressed" model format (.ftz).

## Sample Model

You can find sample models on the FastText website. The one in the `test.js` file is the
compressed Amazon Review Full which can be found at https://fasttext.cc/docs/en/supervised-models.html#content

## License

fasttextJS is BSD-licensed just like the original source. I can only assume that the
patent clause also applies to this port.