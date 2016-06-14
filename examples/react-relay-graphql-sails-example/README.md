# react-relay-graphql-sails-example/

a [Sails](http://sailsjs.org) application

##How to Test
As of now, you can  test this sample using your browser and [PostMan](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en)

1. You need to have babel-node installed
   See https://babeljs.io/docs/usage/cli/

2. Start local mongodb server
  ```
    mongod
  ```  
3. Start the sails server using the command
  npm run server

Run the following in any browser

1. http://localhost:1337/user/create?firstName=hi&lastName=Hello&email=test@test.com&phone=1234
   Note down the user id  
2. Include the userid from previous result
    http://localhost:1337/post/create?text=my%20post&from=\<userid\>
   Note down the user post id
3.  http://localhost:1337/comment/create?text=first%20comment&from=\<userid\>&on=\<postid\>
     http://localhost:1337/comment/create?text=second%20comment&from=\<userid\>&on=\<postid\>
     http://localhost:1337/comment/create?text=third%20comment&from=\<userid\>&on=\<postid\>

4. Execute a POST query using PostMan to http://localhost:1337/graphql with post body as

 ```
  query AppHomeRoute{
    		users{
              firstName,
            id,
            posts{
                  id,
                  text,
                  comments{

                          id,
                          text
                        }

            }
          }
}
```

