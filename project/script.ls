init exampleVar : "example" : g

construct.list(exampleVar2)
index.list(exampleVar2, 0, "test")
print.cons(index.list(exampleVar2, 0))

edit.del(exampleVar2)
print.cons(exampleVar2)

method exampleMethod(temp1) {
  init exampleVar2 : "local var" : l
  print.cons(temp1)
  print.info(exampleVar2)
}
print.info(exampleVar2)

set.random(exampleVar2)
exampleVar2 *= 2
print.cons(exampleVar2)

exampleMethod(exampleVar)

~~ This is a comment :D ~~

~~
Comments can be multiple lines!
~~
