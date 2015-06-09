/**
 * TestController
 *
 * @description :: Server-side logic for managing Testcontroller.js
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
   index: function(req, res){
      res.view();
   },
   joinRoom: function(req, res){
      var data = req.allParams();
      console.log(sails.sockets.id(req.socket)+" joining room "+data.roomName);
      sails.sockets.join(req.socket, data.roomName);
   },
   leaveRoom: function(req, res){
      var data = req.allParams();
      if(sails.sockets.id(req.socket) === data.roomName){
         res.json(200, {error: "Cannot leave the room for your socket connection..."});
         return;
      }
      console.log(sails.sockets.id(req.socket)+" leaving room "+data.roomName);
      sails.sockets.leave(req. socket, data.roomName);
   },
   blast: function(req, res){
      var data = req.allParams();
      console.log('got blast request');
      sails.sockets.blast("blasted", {msg: data.message});
   },
   broadcast: function(req, res){
      var data = req.allParams();
      console.log('broadcasting "'+data.message+'" to room: ', data.roomName);
      sails.sockets.broadcast(data.roomName, 'bcastmsg', {msg: data.message});
   },
   getAllRooms: function(req, res){
      res.json(200, sails.sockets.rooms());
   },
   getMyRooms: function(req, res){
      res.json(200, sails.sockets.socketRooms(req.socket));
   },
   sendToIdViaRoom: function(req, res){
      var data = req.allParams();
      console.log('got request to send '+data.message+" to sockId: "+data.sid+" via room broadcast");
      sails.sockets.broadcast(data.sid, 'directmsg',{
         from: sails.sockets.id(req.socket),
         msg:data.message,
         via:'broadcast'
      });
   },
   getSubs: function(req, res){
      var data = req.allParams();
      res.json(200,sails.sockets.subscribers(data.roomName));
   },
   sendToId: function(req, res){
      var data = req.allParams();
      console.log('got request to send "'+data.message+'" to sockId: '+data.sid+" via emit");
      sails.sockets.emit(data.sid, 'directmsg', {
         from: sails.sockets.id(req.socket),
         msg:data.message,
         via: 'emit'
      });
   }
};
