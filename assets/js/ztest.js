angular.module('testModule', []).controller('testController',
function($scope){

   // lazy
   var sock = window.io.socket;
   $scope.room = '';
   $scope.msg = '';
   $scope.sid = '';
   $scope.roomList = [];

   $scope.joinRoom = joinRoom;
   $scope.leaveRoom = leaveRoom;
   $scope.getAllRooms = getAllRooms;
   $scope.broadcast = broadcast;
   $scope.blast = blast;
   $scope.sendToId = sendToId;
   $scope.sendToIdViaRoom = sendToIdViaRoom;

   updateRoomList();

   function joinRoom(){
      if($scope.roomList.some(roomExists)){
         console.log('This room has already been joined!');
         return;
      }
      console.log('joining a room: '+$scope.room);
      $scope.roomList.push($scope.selected);
      sock.post('/test/joinRoom', {roomName: $scope.room});
      updateRoomList($scope.room);
   }

   function leaveRoom(){
      if(!$scope.roomList.length){
         return;
      }
      console.log('leaving room: '+$scope.selected.room);
      sock.post('/test/leaveRoom', {roomName: $scope.selected.room }, function(e){
         if(e && e.error){
            console.log(e.error);
         }
      });
      $scope.room = '';
      updateRoomList();
   }

   function getAllRooms(){
      updateRoomList();
      console.log('all rooms: ', $scope.roomList.map(function(e){
         return e.room;
      }));
   }

   // this will send to all sockets in the room, regardless of what app theyre connected to (yay!)
   function broadcast(){
      console.log('broadcasting "'+$scope.msg+'" to: ', $scope.selected.room);
      sock.post('/test/broadcast', {roomName: $scope.selected.room, message: $scope.msg });
   }

   // this will send to all sockets connected to ALL apps (yay!)
   function blast(){
      console.log('blasting to all socket connections');
      sock.post('/test/blast', {message: $scope.msg});
   }

   // this will NOT work for multiple node apps with different socket connections (boo.)
   function sendToId(){
      console.log('sending message "'+$scope.msg+'" to '+$scope.sockid);
      sock.post('/test/sendToId', {message: $scope.msg, sid: $scope.sockid });
   }

   // this will work for multiple node apps with different socket connections (yay!)
   function sendToIdViaRoom(){
      console.log('sending message "'+$scope.msg+'" to '+$scope.sockid+' via room.');
      sock.post('/test/sendToIdViaRoom', {message: $scope.msg, sid: $scope.sockid });
   }

   sock.on('blasted', function(d){
      console.log('received a blast: '+d.msg);
   });

   sock.on('bcastmsg', function(d){
      console.log('got message from broadcast in room:', d.msg);
   });

   sock.on('directmsg', function(d){
      console.log('got message from '+d.from+': "'+d.msg+'" via '+d.via);
   });

   // misc functions...
   function roomExists(e){
      return e.room === $scope.room;
   }

   function updateRoomList(room){
      sock.post('/test/getAllRooms', function(d){
         if(!d.length){
            return;
         }
         $scope.roomList = d.map(function(e){
            return {
               room: e
            };
         });
         $scope.selected = !!room ?
            $scope.roomList.filter(function(e){ return e.room === room; })[0] :
            $scope.roomList[0];
         $scope.$apply();
      });
   }

   ZeroClipboard.config({ swfPath: "//cdn.jsdelivr.net/zeroclipboard/2.2.0/ZeroClipboard.swf"});
   var client = new ZeroClipboard( document.getElementById("copy") );
   client.on( "aftercopy", function( event ) {
      console.log("Copied!");
   });

});
