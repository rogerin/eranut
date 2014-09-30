/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        $('#boxLoad').show();
        $('#boxListDevices').hide();
        $('#formGrava').hide();
        this.bindEvents();
        this.onSubmitForm();
    },
    

    bindEvents: function() {
       
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //document.addEventListener('click', this.onSelectDevice, false)/

    },
  

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        $( document ).bind( "mobileinit", function() {
            $.mobile.page.prototype.options.keepNative = "select, input.foo, textarea.bar";
        });
    },
    display: function(message) {
        $('#message').append('<li>'+ message +'</li>').listview('refresh');
    },
    onSubmitForm: function(){
        $('#formGrava').on('submit', function(){
            //app.display("Enviando form..");

           
            var seg  = $("#flip-0").val();
            var ter  = $("#flip-1").val();
            var qua  = $("#flip-2").val();
            var qui  = $("#flip-3").val();
            var sex  = $("#flip-4").val();
            var sab  = $("#flip-5").val();
            var dom  = $("#flip-6").val();
            var inte = $("#int").val();
            

            app.sendToArduino(seg+ter+qua+qui+sex+sab+dom+inte+"?");
            return false;
        });
    },

    receivedEvent: function(id) {

        var listPorts = function() {
            bluetoothSerial.list(
                function(results) {
                    $('#boxLoad').hide();
                    $('#boxListDevices').show();
                    //app.display(JSON.stringify(results));
                    $.each(results, function(i, item){
                        //app.display("Ach " + i + "|" + item.id + "|" + item.name);
                        $('#listDevices').append('<li><a href=\"#\" id=\"'+item.address+'\" class=\"listDevices\">  '+item.name+' <small> End.: '+item.address+'</small></a></li>').listview('refresh');
                    });

                    $('.listDevices').on('click', function(){
                        $('#boxLoad').show();
                        $('#boxListDevices').hide();
                        app.onSelectDevice($(this).attr("id"));
                    }); 
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        };

        var notEnabled = function() {
            $('#boxListDevices').hide();
            $('#boxLoad').hide();
            app.display("Bluetooth is *not* enabled");
        };

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );


    },

    onSelectDevice: function(uuid){
    
        var connect = function () {
            
            app.display("tentando conectar a: " + uuid);
            app.display("Conectando... ");

            bluetoothSerial.connect(
                uuid,  
                app.openPort(uuid),    
                app.failure    
            );
        };


        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort(uuid),     // stop listening to the port
                app.failure      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);

    },
    sendToArduino: function(c) {
        bluetoothSerial.write(c + "\n");
        app.display("Send: " + c);
    },

    failure: function(error) {
         app.display(error);
         $("#boxLoad").hide();
         $("#boxListDevices").show();
         bluetoothSerial.disconnect(function(){
            app.display("Desconectado");
            $('#formGrava').hide();
         },function(){
            app.display("Erro ao desconectar");         
         });

    },
    openPort: function(uuid) {

        app.display("Connected to: " + uuid);
        $("#boxLoad").hide();
        $("#boxListDevices").hide();
        $('#formGrava').show();
        
        bluetoothSerial.subscribe('\n', function (data) {
            var obj;
            //app.display("subscribe: " + data);
            //obj = JSON.parse(data);
            obj = JSON && JSON.parse(data) || $.parseJSON(data);

            $.each(obj.dias, function(i, v) {
                var setandoInt = parseInt(v.valor);
                if (setandoInt == 49) {
                    $("#dia-"+i+"").html("<span class=\"label label-success\">Sim</span>");
                } else {
                    $("#dia-"+i+"").html("<span class=\"label label-danger\">Não</span>");                    
                }
                // $("#dia-"+i+"").html(""+statusDia(parseInt(v.valor)+"");
            });


            var info = ""+obj.dia +" de  " + obj.mes + " de " + obj.ano+"";
            var hora = ""+obj.hora + ":"+ obj.minuto + ":"+ obj.segundo+"";
            var intervalo = ""+obj.intervalo +"";
            $("#data").text(info);
            $("#hora").text(hora);
            $("#intervalo").text(intervalo);
            

            //if (data.a === parseInt(data.valor))
            //app.mudaStatus("#flip-"+parseInt(obj.dia)+"", ""+parseInt(obj.valor)+"");
            //mudaStatus("#flip-1", ""+data.LUZ1+"");

        });

        bluetoothSerial.available(function (numBytes) {
            console.log("There are " + numBytes + " available to read.");
            app.display("bytes: " + numBytes);
        }, app.failure);

        bluetoothSerial.read(function (data) {
            app.display("read: " + data);
        }, app.failure);


        var i = 0;
        setInterval(function(){
            //app.sendToArduino("rogerio");
            i++;    
        }, 1500);
    },
    closePort: function(uuid) {
        app.display("Disconnected from: " + uuid);
    
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display("unsubscribe:" + data);
                },
                app.failure
        );
    },
    mudaStatus: function(id, val){
        $(""+id+"").val(""+val+"").slider('refresh');
        //app.display("ID: " + id + " : " +val);
        //var valor = $(""+id+"");
        //app.display("VAL:" + valor);
    },
    statusDia: function(valor){
        //var convertendo = parseInt(valor);
        if(valor == 1) {
            return "Sim";
        } else {
            return "Não";
        }
    }
};
