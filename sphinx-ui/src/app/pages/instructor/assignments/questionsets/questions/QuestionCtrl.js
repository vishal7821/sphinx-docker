(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor')
  .config(function($sceDelegateProvider) {
        // todo: white list our backend only, it caan lead to XSS attack
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
        $.jstree.defaults.core.themes.url = true;
        $.jstree.defaults.core.themes.dir = "assets/img/theme/vendor/jstree/dist/themes";
      })
  .controller('QuestionCtrl', QuestionCtrl)
  .controller('QueModalInstanceCtrl', ['$scope','$rootScope', '$uibModalInstance','$http','config','toastr',
    function($scope,$rootScope, $uibModalInstance,$http,config, toastr) {

        // get topics
        $http({
          url:  config.domain+'/course/'+$rootScope.course_id+'/topics/',
          method: "GET",
          headers: {
            'Access-Control-Allow-Origin': true,
            'Content-Type': 'application/json; charset=utf-8',
            "X-Requested-With": "XMLHttpRequest"
          }
        })
        .then(function(response) {
          $scope.Alltopics = response.data.data ;
          $scope.multipleSelectItems = response.data.data;
          console.log(response)
        }, 
              function(response) { // optional
                console.log(response)
              });


        $scope.updateQuestion = function($index) {
          var selectedQuestionId = $('#basicTree').jstree('get_selected')[0]; 
          var topicsIdArr = new Array();
            // or var arr = [];
          //arr.push('value1');
          if($scope.topics.selected.length>0){
            $scope.topics.selected.forEach(function (topic) {
              topicsIdArr.push(topic.id);
            });
          }
          
          var paramData={};   
          paramData['is_actual_question'] = 1;
          paramData['title'] = $scope.title;
          paramData['text'] = $scope.question_text;
          paramData['difficulty_level'] = $scope.difficulty_level;
          paramData['marks'] = $scope.total_marks;
          paramData['topics'] = topicsIdArr;
          $http({
            url:  config.domain+'/auth/csrf_token',
            method: "GET",
            headers: {
              'Access-Control-Allow-Origin': true,
              'Content-Type': 'application/json; charset=utf-8',
              "X-Requested-With": "XMLHttpRequest"
            }
          })
          .then(function(response) {
            $http({
              url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+$rootScope.question_set_id+'/question/'+Number.parseInt(selectedQuestionId)+'/',
              method: "PUT",
              data: paramData,
              headers: {
                'Access-Control-Allow-Origin': true,
                'Content-Type': 'application/json; charset=utf-8',
                "X-Requested-With": "XMLHttpRequest",
                "CSRF-TOKEN": response.data.csrf_token
              }
            })
            .then(function(response) {
              console.log(response);
              if($scope.treeData.length>0){
                $scope.treeData.forEach(function (treeNode) {
                  if(treeNode.id == selectedQuestionId){
                    treeNode.text = "Q." + response.data.question.subpart_no +' '+$scope.title;
                  }
                });
              }
              $scope.getQuestions();
              toastr.success('Question Updated Successfully!');
              //$scope.basicConfig.version++;
                        //getQuestions();
                      }, 
                    function(response) { // optional
                       toastr.error(response.data, 'Error');
                      console.log(response)
                    });
          }, 
            function(response) { // optional
              console.log(response)
            });
        };


        $scope.ok = function () {
          console.log($scope.selectedNode)
          $scope.updateQuestion();
          $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      }]);






// const gallery = new Viewer(document.getElementById('QImages'));
/** @ngInject */
function QuestionCtrl($scope,$rootScope,$timeout, $http, $location, $filter, $sce,$uibModal, editableOptions, editableThemes,config, toastr) {
  $scope.multipleItem = {}
    //get question image
    $http({
      url:  config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+$rootScope.question_set_id+'/question_file/images/',
      method: "GET",
      headers: {
        'Access-Control-Allow-Origin': true,
        'Content-Type': 'application/json; charset=utf-8',
        "X-Requested-With": "XMLHttpRequest"
      }
    })
    .then(function(response) {
      $scope.question_images = response.data.question_file_images
      console.log(response)
    }, 
              function(response) { // optional
                console.log(response)
              });


    
    function convertToTreeData(questions){
      $scope.treeData = []

      questions.forEach(function (que) {
        if(que.parent == null){
          que.parent = '#'
        }
        var x = {
          "id": que.id,
          "parent": que.parent,
          "type": "folder",
          "text": 'Q.'+que.subpart_no+' '+ que.text,
          "state": {
            "opened": true
          }
        }
        $scope.treeData.push(x)
      })
    }

    //function to get all Questions
    $scope.getQuestions = function () {
         $http({
          url:  config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+$rootScope.question_set_id+'/questions/',
          method: "GET",
          headers: {
            'Access-Control-Allow-Origin': true,
            'Content-Type': 'application/json; charset=utf-8',
            "X-Requested-With": "XMLHttpRequest"
          }
        })
        .then(function(response) {
          $scope.questions = response.data.questions
          convertToTreeData($scope.questions)
          $scope.refresh()
          console.log(response)
        }, 
                  function(response) { // optional
                    console.log(response)
                  });

    };
    $scope.getQuestions();
      // get topics
      $http({
        url:  config.domain+'/course/'+$rootScope.course_id+'/topics/',
        method: "GET",
        headers: {
          'Access-Control-Allow-Origin': true,
          'Content-Type': 'application/json; charset=utf-8',
          "X-Requested-With": "XMLHttpRequest"
        }
      })
      .then(function(response) {
        $scope.topics = {'selected':response.data.data[0]} ;
        $scope.multipleSelectItems = response.data.data;
        console.log(response)
      }, 
              function(response) { // optional
                console.log(response)
              });

      
    // create new question
    function createNewQuestion(parentid , subpart_no){

      var topicsIdArr = new Array();
            // or var arr = [];
          //arr.push('value1');
          if($scope.topics.selected != null && $scope.topics.selected.length>0){
            $scope.topics.selected.forEach(function (topic) {
              topicsIdArr.push(topic.id);
            });
          }
          
          var paramData={};   
          if(parentid != -1){
            paramData['parent'] = parentid;
          }
          paramData['is_actual_question'] = 1;
          paramData['title'] = $scope.title;
          paramData['text'] = $scope.question_text;
          paramData['difficulty_level'] = $scope.difficulty_level;
          paramData['marks'] = $scope.total_marks;
          paramData['subpart_no'] = subpart_no;
          paramData['topics'] = topicsIdArr;
          $http({
            url:  config.domain+'/auth/csrf_token',
            method: "GET",
            headers: {
              'Access-Control-Allow-Origin': true,
              'Content-Type': 'application/json; charset=utf-8',
              "X-Requested-With": "XMLHttpRequest"
            }
          })
          .then(function(response) {
            $http({
              url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+$rootScope.question_set_id+'/questions/',
              method: "POST",
              data: paramData,
              headers: {
                'Access-Control-Allow-Origin': true,
                'Content-Type': 'application/json; charset=utf-8',
                "X-Requested-With": "XMLHttpRequest",
                "CSRF-TOKEN": response.data.csrf_token
              }
            })
            .then(function(response) {
              console.log(response);
              // var AssignParent = "#";
              // if(parentid !=-1){
              //   AssignParent = parentid.toString();
              // }
              // $scope.treeData.push({
              //   id: response.data.question.id,
              //   parent: AssignParent,
              //   text: "Q." + response.data.question.subpart_no +' '+$scope.title,
              //   state: {opened: true}
              // });
              // $scope.basicConfig.version++;
                $scope.getQuestions();
                toastr.success('Question Created Successfully!');
                      }, 
                    function(response) { // optional
                      console.log(response)
                    });
          }, 
            function(response) { // optional
              console.log(response)
            });

        }

        $scope.ignoreChanges = false;
        var newId = 0;
        $scope.ignoreChanges = false;
        $scope.newNode = {};

        $scope.basicConfig = {
          core: {
            multiple: false,
            check_callback: true,
            worker: true
          },
          'types': {
            'folder': {
              'icon': 'ion-ios-folder'
            },
            'default': {
              'icon': 'ion-document-text'
            }
          },
          'plugins': ['types'],
          'version': 1
        };

        $scope.addNewNode = function () {
          $scope.ignoreChanges = true;
          var selected = $('#basicTree').jstree('get_selected');

          var rootNode = $('#basicTree').jstree(true).get_node('#');
          var selectedId =  -1;


          if (selected[0]){
            var childrens = $("#basicTree").jstree("get_children_dom",selected);
            if(selected[0] != '#')
            {
              selectedId = Number.parseInt(selected[0]);
              createNewQuestion(selectedId, childrens.length+1);
            }else{
              createNewQuestion(selectedId, childrens.length+1);
            }

          }else{
            var childrens = $("#basicTree").jstree("get_children_dom",rootNode);
            createNewQuestion(selectedId, childrens.length+1);
          }
        };


      //delete question
      function deleteQuestion(){
        var selectedQuestionId = $('#basicTree').jstree('get_selected')[0]; 
        if(selectedQuestionId)
        {
          if(selectedQuestionId != '#'){
            $http({
              url:  config.domain+'/auth/csrf_token',
              method: "GET",
              headers: {
                'Access-Control-Allow-Origin': true,
                'Content-Type': 'application/json; charset=utf-8',
                "X-Requested-With": "XMLHttpRequest"
              }
            })
            .then(function(response) {
              $http({
                url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+$rootScope.question_set_id+'/question/'+Number.parseInt(selectedQuestionId)+'/',
                method: "DELETE",
                headers: {
                  'Access-Control-Allow-Origin': true,
                  'Content-Type': 'application/json; charset=utf-8',
                  "X-Requested-With": "XMLHttpRequest",
                  "CSRF-TOKEN": response.data.csrf_token
                }
              })
              .then(function(response) {
                            // console.log(isDeleted);
                            var treearray = $scope.treeData;
                            $scope.treeData = treearray.filter(function(el) { return el.id != selectedQuestionId; }); 
                            $scope.basicConfig.version++;
                            toastr.success('Question Deloted Successfully!');
                          // $scope.treeData = getDefaultData();
                          console.log(response)
                        }, 
                      function(response) { // optional
                        console.log(response)
                      });
            }, 
              function(response) { // optional
                console.log(response)
              });
          }else{
            toastr.error("Please select the question to be deleted!", 'Error');
         
          }

        }else{
         toastr.error("Please select the question to be deleted!", 'Error');
        }
      }


      $scope.removeQuestion = function() {
        deleteQuestion();
        //$scope.treeData = getDefaultData();
        //$scope.basicConfig.version++;
      };
      $scope.refresh = function () {
        $scope.ignoreChanges = true;
        newId = 0;
        $scope.treeData = getDefaultData();
        $scope.basicConfig.version++;
      };

      $scope.expand = function () {
        $scope.ignoreChanges = true;
        $scope.treeData.forEach(function (n) {
          n.state.opened = true;
        });
        $scope.basicConfig.version++;
      };

      $scope.collapse = function () {
        $scope.ignoreChanges = true;
        $scope.treeData.forEach(function (n) {
          n.state.opened = false;
        });
        $scope.basicConfig.version++;
      };

      $scope.readyCB = function() {
        $timeout(function() {
          $scope.ignoreChanges = false;
        });
      };


      $scope.applyModelChanges = function() {
        return !$scope.ignoreChanges;
      };

      // $scope.treeData = getDefaultData();
      

      function getDefaultData() {
        return $scope.treeData
      }

      //$scope.title = 'qwert'; 
      $scope.openEditQModel = function (page,size){
       $scope.selectedQuestionId = $('#basicTree').jstree('get_selected')[0]; 
       $scope.selectedNode = $scope.treeData[0];

       
        //get selected question from question data
        $scope.questions.forEach(function (que) {
          if(que.id == $scope.selectedQuestionId){
           $scope.selectedNode = que;
         }
       })

        $scope.title = $scope.selectedNode.title;
        $scope.question_text = $scope.selectedNode.text;
        $scope.difficulty_level = Number.parseInt($scope.selectedNode.difficulty_level);
        $scope.total_marks = $scope.selectedNode.marks;
        $scope.topics.selected = new Array();
        $scope.selectedNode.topics.forEach(function(topicId){
          $scope.multipleSelectItems.forEach(function (x) {
            if(x.id == topicId){
             $scope.topics.selected.push(x);
           }
         })
        })


        $uibModal.open({
          animation: true,
          templateUrl: page,
          size: size, 
          scope:$scope,
          controller:'QueModalInstanceCtrl'
        }).result.then(function (data) {          
          console.log('close')
        }, function () {
                       // action on popup dismissal.
                       console.log("fail")
                     });
      }

      $scope.open = function (page, size) {

        $uibModal.open({
          animation: true,
          templateUrl: page,
          size: size, 
          scope:$scope,
          resolve: {
            multipleItem : function(){return $scope.multipleItem},
            multipleSelectItems : function(){return $scope.multipleSelectItems}
          }
        }).result.then(function (data) {    
          if(data.flag == 'add'){
            $scope.title = data.title
            $scope.question_text = data.question_text
            $scope.difficulty_level=data.difficulty_level
            $scope.total_marks = data.total_marks
            $scope.addNewNode()
          }else if(data.flag == 'delete'){
            $scope.removeQuestion()
          }               

          console.log('close')
        }, function () {
                       // action on popup dismissal.
                       console.log("fail")
                     });
      };

    }
  })();
  