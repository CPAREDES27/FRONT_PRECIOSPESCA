sap.ui.define([
	"./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/m/Link',
	'sap/m/MessageItem',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
    'sap/ui/model/odata/v2/ODataModel',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
	'sap/m/Token',
	'sap/ui/core/Popup',
	"../model/utilitarios"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	 function (BaseController,Controller,JSONModel,History,Link, MessageItem, MessageToast,MessageBox,exportLibrary, Spreadsheet, ODataModel,Filter,FilterOperator,ExportTypeCSV,Export,Token,Popup,utilitarios) {
		"use strict";

		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
		var popUp="";
		var EdmType = exportLibrary.EdmType;
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var array=[];
		var arrayEstado=[];
		var arrayEstado=[];
            var JsonFechaIni={
                fechaIni:"",
                fechaIni2:""
            };
            var JsonFechaFin={
                fechaFin:"",
                fechaFin2:""
            };
			var contador=0;
		return BaseController.extend("com.tasa.politicadeprecios.controller.App", {
			onInit: function () {
				let ViewModel= new JSONModel(
                    {}
                
                );
				console.log(utilitarios.metodo());
			
             
                this._oGlobalFilter = null;
                this.setModel(ViewModel,"litoral");
                this.setModel(ViewModel,"precio");
                this.setModel(ViewModel,"reporteCala")
                
                this.loadCombos()
				this.listPuerto();
				this.listPlanta();
				
          


			var oModel = new JSONModel();
		
			this.getView().setModel(oModel);
			},
			
			listaArmador: function(){
				oGlobalBusyDialog.open();
				var body={
					"codigo": "100"
				  }
				  fetch(`${mainUrlServices}General/Armador`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						var dataPuerto=data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Armador").setProperty("/listaArmador",dataPuerto));
				
							oGlobalBusyDialog.close();
					
						
						
					  }).catch(error => console.log(error)
					  );
			},
			listPuerto: function(){
				oGlobalBusyDialog.open();
				var body={
					"delimitador": "|",
					"fields": [
					  
					],
					"no_data": "",
					"option": [
					  
					],
					"options": [
					  
					],
					"order": "",
					"p_user": "FGARCIA",
					"rowcount": 0,
					"rowskips": 0,
					"tabla": "ZV_FLPU"
				  };
				  fetch(`${mainUrlServices}General/Read_Table`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						var dataPuerto=data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Puerto").setProperty("/listaPuertos",dataPuerto));
						while(dataPuerto>1){
							oGlobalBusyDialog.close();
							break;
						}
					  }).catch(error => console.log(error)
					  );

			},
			listPlanta: function(){
				oGlobalBusyDialog.open();
				var dataPlantas={
					"delimitador": "|",
					"fields": [
					 
					],
					"no_data": "",
					"option": [
					  {
						"wa":"INPRP = 'P'"
						},
						{
						"wa":"AND ESREG = 'S'"
						}
					],
					"options": [
					  
					],
					"order": "",
					"p_user": "FGARCIA",
					"rowcount": 0,
					"rowskips": 0,
					"tabla": "ZV_FLPL"
				  }
				  fetch(`${mainUrlServices}General/Read_Table`,
				  {
					  method: 'POST',
					  body: JSON.stringify(dataPlantas)
				  })
				  .then(resp => resp.json()).then(data => {
					var dataPuerto=data.data;
					
					console.log(this.getView().getModel("Planta").setProperty("/listaPlanta",dataPuerto));
					while(dataPuerto>1){
						oGlobalBusyDialog.close();
						break;
					}
				  }).catch(error => console.log(error)
				  );
				
			},
			
			loadCombos:function(){
				oGlobalBusyDialog.open();
			   
				 
				  let litoral=null;
				  let zdoZinprpDom = null;
				  let zdoTipoMareaDom = null;
				  let especie = null;
				  const bodyDominio = {
					  "dominios": [
						  {
							  "domname": "LITORAL"
						  },
						  {
							  "domname": "ZESPRC",
							  "status": "A"
						  },
						  {
							  "domname": "ESPECIE"
						  }
  
					  ]
				  }
					  fetch(`${mainUrlServices}dominios/Listar`,
					  {
						  method: 'POST',
						  body: JSON.stringify(bodyDominio)
					  })
					  .then(resp => resp.json()).then(data => {
						  
						  console.log(data);
						  zdoZinprpDom = data.data.find(d => d.dominio == "LITORAL").data;
						  zdoTipoMareaDom= data.data.find(d => d.dominio == "ZESPRC").data;
						  especie = data.data.find(d => d.dominio == "ESPECIE").data;
						  this.getModel("litoral").setProperty("/zdoZinprpDom", zdoZinprpDom);
						  this.getModel("precio").setProperty("/zdoTipoMareaDom", zdoTipoMareaDom);
						  this.getView().getModel("Especie").setProperty("/listaEspecie",especie)
						  oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
					  );
				  
			  },
			  
			  anular: function(oEvent){
				var codigo=oEvent.getSource().getBindingContext("PoliticaPrecio").getProperty("CDPPC");
				MessageBox.warning(
					"Desea anular el registro?", {
						icon: MessageBox.Icon.WARNING,
						title: "Anular",
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						emphasizedAction: MessageBox.Action.YES,
						onClose: function (oAction) { if(oAction=="YES"){
							
							var array=[];
							array[0]=codigo;
							this.anularPrecio(array);
							
							
						}else{oGlobalBusyDialog.close();}}.bind(this)
					}
				); 
				
			  },
			  anularRegistro: function(oEvent){
				
				oGlobalBusyDialog.open();
                var indice = this.byId("table").getSelectedIndices();
                var data ;
				console.log(indice);
                var arreglo=this.getView().byId("table").getModel("PoliticaPrecio").oData.listaPolitica;
                console.log(arreglo);
                
                var array=[];
                MessageBox.warning(
                            "Desea anular el registro?", {
                                icon: MessageBox.Icon.WARNING,
                                title: "Anular",
                                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                                emphasizedAction: MessageBox.Action.YES,
                                onClose: function (oAction) { if(oAction=="YES"){
                                   for(var j=0;j<indice.length;j++){
                                            for(var i=0;i<arreglo.length;i++){
                                                if(i==indice[j]){
                                                        array[i]=arreglo[i].CDPPC;
                                                    }
                                            }
                                    }
                                    this.anularPrecio(array);
									oGlobalBusyDialog.close();
                                }else{oGlobalBusyDialog.close();}}.bind(this)
                            }
                        ); 
               /*if(!indice.length){
                    MessageBox.error("Debe seleccionar un elemento  ");
                    return;
               }else{*/
                
               //}                
            },
            anularPrecio: function(array){

                var cadena="";
                if(array.length<1){
                    cadena="El registro"+ array + " fue anulado";
                }else{
                    for(var i=0;i<array.length;i++){
                        cadena += "El registro "+array[i] + " fue anulado\n";
                    }
                    
                }
                console.log(array);
                var agregar=[];
                var options=[];
                for (var i = 0; i < array.length; i++) {
                        agregar ={                        
                            "atcrn": "",
                            "cdemp": "",
                            "cdppc": array[i],
                            "cdpta": "",
                            "cdpto": "",
                            "cdspc": "",
                            "cdzlt": "",
                            "espmr": "",
                            "ffvig": "",
                            "fhcrn": "",
                            "fivig": "",
                            "hrcrn": "",
                            "mandt": "",
                            "prcmx": "",
                            "prctp": "",
                            "prvmn": "",
                            "prvtp": "",
                            "waers": ""
                        }
                        options.push(agregar);
               }
                var bodyGuardar={
					"p_campo":"",
					"p_indtr":"A",
					"p_user":"FGARCIA",
					"str_ppc":options
				 };
              
                console.log(bodyGuardar);
             
                 fetch(`${mainUrlServices}preciospesca/Mant`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodyGuardar)
                    })
                    .then(resp => resp.json()).then(data => {

						this.loadTablaPrecios();
                        MessageBox.success(cadena);
                    }).catch(error => MessageBox.error("El servicio no está disponible")
                    );

            },
			   loadTablaPrecioss:function(){
				  
				  oGlobalBusyDialog.open();
				  let options=[];
				  let comandos=[];
				  let option=[];
				  let puerto= this.byId("txtPuerto").getValue();
				  let puerto2= this.byId("txtPuerto2").getValue();
				  let planta= this.byId("txtPlanta").getValue();
				  let planta2= this.byId("txtPlanta2").getValue();
				  let armador= this.byId("txtArmador").getValue();
				  let armador2= this.byId("txtArmador2").getValue();
				  let fechaIni= this.byId("idFechaInicioVig").getValue();
				  let fechaIni2= this.byId("idFechaInicioVig2").getValue();
				  let fechaFin= this.byId("idFechaFinVig").getValue();
				  let fechaFin2= this.byId("idFechaFinVig2").getValue();
				  let especie= this.byId("idEspecie").getValue();
				  let especie2= this.byId("idEspecie2").getValue();
				  let estadoPrecio= this.byId("cbEstadoPrecio").getSelectedKey();
				  //#region
				  
				  var cadena="";
				  var num = this.byId("cboLitoral").getSelectedKeys();
				  console.log(num);
				  if(num!='' || num!=""){
					  for(var i=0;i<num.length;i++){
						  
						  if(i>0){
							  option.push({
								  "wa":"OR CDZLT = '"+num[i]+"'"
							  });
						  }else{
							  option.push({
								  "wa":"CDZLT = '"+num[i]+"'"
							  });
						  }
					  }
				  }
				  if(estadoPrecio){
						  options.push({
							  cantidad: "10",
							  control:"COMBOBOX",
							  key:"ESPMR",
							  valueHigh: "",
							  valueLow:estadoPrecio
						  });
					
				  }else{
					  MessageBox.error("Debe Ingresar un Estado de Precio");
				
					  oGlobalBusyDialog.close();
					  return true;
				  }
				  
				  if(puerto || puerto2){
					  options.push({
						  cantidad: "10",
						  control:"MULTIINPUT",
						  key:"CDPTO",
						  valueHigh: puerto2,
						  valueLow:puerto
					  });
				  }
				  if(planta || planta2){
					  options.push({
						  cantidad: "10",
						  control:"MULTIINPUT",
						  key:"WERKS",
						  valueHigh: planta2,
						  valueLow:planta
					  });
				  }
  
				  if(armador || armador2){
					  options.push({
						  cantidad: "10",
						  control:"MULTIINPUT",
						  key:"CDEMP",
						  valueHigh: armador2,
						  valueLow:armador
					  });
				  }
				  if(especie || especie2){
					  options.push({
						  cantidad: "10",
						  control:"MULTIINPUT",
						  key:"CDSPC",
						  valueHigh: especie2,
						  valueLow:especie
					  });
				  }
				  
				  if(fechaIni || fechaIni2){
					  options.push({
						  cantidad: "10",
						  control:"INPUT",
						  key:"FIVIG",
						  valueHigh: fechaIni2,
						  valueLow:fechaIni
					  });
				  }
				  if(fechaFin || fechaFin2){
					  options.push({
						  cantidad: "10",
						  control:"INPUT",
						  key:"FFVIG",
						  valueHigh: fechaFin2,
						  valueLow:fechaFin
					  });
				  }
				  
				  if(estadoPrecio){
					  options.push({
						  cantidad: "10",
						  control:"COMBOBOX",
						  key:"ESPMR",
						  valueHigh: "",
						  valueLow:estadoPrecio
					  });
				  }
				  //#endregion
				  console.log(fechaIni, "" , fechaIni2);
				  let body = {
					  "option": option,
					  "options": options,
					  "p_user": "FGARCIA"
				  }
				  console.log(body);
				  var indice=-1;
				 fetch(`${mainUrlServices}preciospesca/Leer`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						  
						  var dataPrecio = data;
						  console.log(dataPrecio.str_ppc);
						  this.getView().getModel("PoliticaPrecio").setProperty("/listaPolitica",dataPrecio.str_ppc);
						  
						  //this.getModel("reporteCala").setProperty("/items", data.str_ppc);
						  //this.getModel("reporteCala").refresh();
						   oGlobalBusyDialog.close();
					  }).catch(error => MessageBox.error("El servicio no está disponible  ")
					  );
  
  
			  },
			  buscarFecha: function(oEvent){
                
                var dateIni= new Date(oEvent.mParameters.from);
                var dateIni2 = new Date(oEvent.mParameters.to);
				if(oEvent.mParameters.from==null){
					dateIni="";	
				}
				if(oEvent.mParameters.to==null){
					dateIni2="";	
				}
                var id=oEvent.mParameters.id;
				var fechaIni="";
				var fechaIni2="";
				if(dateIni){
					 fechaIni=this.generateFecha(dateIni);
				}
                if(dateIni2){
					 fechaIni2=this.generateFecha(dateIni2);
				}

                console.log(fechaIni);
				console.log(fechaIni2);
				
                if(id==="application-politicadeprecios-display-component---App--idFechaIniVigencia")
                {
                    JsonFechaIni={
                        fechaIni:fechaIni,
                        fechaIni2:fechaIni2
                    }
                }else{
                    JsonFechaFin={
                        fechaFin:fechaIni,
                        fechaFin2:fechaIni2
                    }
                }
               
                console.log(JsonFechaIni);
                console.log(JsonFechaFin);
               
            },
            generateFecha: function(date){
				console.log(date);
                var day=date.getDate();
                var anio=date.getFullYear();
                var mes=date.getMonth()+1;
                if(mes<10){
                    mes=this.zeroFill(mes,2);
                }
                if(day<10){
                    day=this.zeroFill(day,2);
                }
                var fecha= anio.toString()+mes.toString()+day.toString();
               
               
                return fecha;
            },
            zeroFill: function( number, width )
            {
                width -= number.toString().length;
                if ( width > 0 )
                {
                    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
                }
                return number + ""; // siempre devuelve tipo cadena
            },
            limpiarFiltros: function(){
				console.log(this.byId("cboLitoral").setSelectedKeys(""));
				this.byId("idPuertoIni").setValue("");
				this.byId("idPuertoFin").setValue("");
				this.byId("idPlantaIni").setValue("");
				this.byId("idPlantaFin").setValue("");
				this.byId("idArmadorIni").setValue("");
				this.byId("idArmadorFin").setValue("");
				this.byId("idEspecieIni").setValue("");
				this.byId("idEspecieFin").setValue("");
				this.byId("idFechaIniVigencia").setValue("");
				this.byId("idFechaFinVigencia").setValue("");
				JsonFechaFin={
					fechaFin:"",
					fechaFin2:""
				}
				JsonFechaIni={
					fechaFin:"",
					fechaFin2:""
				}

			},		  
			castFechas: function(fecha){
				var arrayFecha=fecha.split("/");
				console.log(arrayFecha);
				var fechas = arrayFecha[2]+""+arrayFecha[1]+""+arrayFecha[0];
				return fechas;
			},
			  
			loadTablaPrecios:function(event){
				oGlobalBusyDialog.open();
			   let options=[];
			   let comandos=[];
			   let option=[];
			   var idPuertoIni=this.byId("idPuertoIni").getValue();
			   var idPuertoFin=this.byId("idPuertoFin").getValue();
			   var idPlantaIni=this.byId("idPlantaIni").getValue();
			   var idPlantaFin=this.byId("idPlantaFin").getValue();
			   var arrayPuerto=[];
			   var arrayPlanta=[];
			//region  
			//    for(var i=0;i<textPlanta.length;i++){
			// 	arrayPlanta[i]=textPlanta[i].mProperties.key;
			//    }
			//    if(textPlanta.length===1){
			// 	arrayPlanta[1]=textPlanta[0].mProperties.key;
			//    }

			//    for(var i=0;i<text.length;i++){
			// 	arrayPuerto[i]=text[i].mProperties.key;
			//    }
			//    if(text.length===1){
			// 	arrayPuerto[1]=text[0].mProperties.key;
			//    }
			   
			   
			//    console.log(arrayPuerto);
			//    if(arrayPuerto.length>2){
			// 	   MessageBox.error("Solo se permite seleccionar 2 puertos");
			// 	   oGlobalBusyDialog.close();
			// 	   return false;
				   
			//    }
			//    if(arrayPlanta.length>2){
			// 	MessageBox.error("Solo se permite seleccionar 2 plantas");
			// 	oGlobalBusyDialog.close();
			// 	return false;
			
			// }
			//endregion
			   let idArmadorIni= this.byId("idArmadorIni").getValue();
			   let idArmadorFin= this.byId("idArmadorFin").getValue();
			   let idEspecieIni= this.byId("idEspecieIni").getValue();
			   let idEspecieFin= this.byId("idEspecieFin").getValue();
			   let estadoPrecio= this.byId("cbEstadoPrecio").getSelectedKey();
			   
			
			   var fechaIni=this.byId("idFechaIniVigencia").getValue();
			   var fechaFin=this.byId("idFechaFinVigencia").getValue();
			   var error=""
			   var estado=true;
			   if(!fechaIni){
				error="Debe ingresar una fecha de inicio de vigencia\n";
				estado=false;
			   }
			   if(!fechaFin){
				   error+="Debe ingresar una fecha Fin de vigencia";
				   estado=false;
			   }
			   if(!estado){
				   MessageBox.error(error);
				   oGlobalBusyDialog.close()
				   return false;
			   }
			   var feccc =[];
			   feccc= fechaIni.trim().split("-");
			   for(var i=0;i<feccc.length;i++){
				   feccc[i]=feccc[i].trim();
			   }
			   var fechaIniVigencia= this.castFechas(feccc[0]);
			   var fechaIniVigencia2= this.castFechas(feccc[1]);
			   console.log(fechaIniVigencia+" "+fechaIniVigencia2);
			   var feccc2 =[];
			   feccc2= fechaFin.trim().split("-");
			   for(var i=0;i<feccc2.length;i++){
				   feccc2[i]=feccc2[i].trim();
			   }
			   var fechaFinVigencia= this.castFechas(feccc2[0]);
			   var fechaFinVigencia2= this.castFechas(feccc2[1]);
			   console.log(fechaFinVigencia+" "+fechaFinVigencia2);
			//region
			// var JsonFechaIni={
            //     fechaIni:"",
            //     fechaIni2:""
            // };
            // var JsonFechaFin={
            //     fechaFin:"",
            //     fechaFin2:""
            // };
			// console.log(JsonFechaIni.fechaIni+" "+JsonFechaIni.fechaIni2);
			// console.log(JsonFechaFin.fechaFin+" "+JsonFechaFin.fechaFin2);
			//    if(JsonFechaIni.fechaIni==="" || JsonFechaIni.fechaIni2===""){
			// 	   error="Debe ingresar fecha de inicio de vigencia\n";
			// 	   estado= false;
			//    }
			//    if(JsonFechaFin.fechaFin==="" || JsonFechaFin.fechaFin2===""){
			// 		error+="Debe ingresar fecha de Fin de vigencia";
			
			// 		estado= false;
			// 	}
			// 	if(!estado){
			// 		MessageBox.error(error);
			// 		oGlobalBusyDialog.close();
			// 		return false;
			// 	}
			//endregion
			   var cadena="";
			   var num = this.byId("cboLitoral").getSelectedKeys();
			   console.log(num);
			   
			   if(num!='' || num!=""){
				   for(var i=0;i<num.length;i++){
					   
					   if(i>0){
						   option.push({
							   "wa":"OR CDZLT = '"+num[i]+"'"
						   });
					   }else{
						   option.push({
							   "wa":"CDZLT = '"+num[i]+"'"
						   });
					   }
				   }
			   }
			   if(estadoPrecio){
					   options.push({
						   cantidad: "10",
						   control:"COMBOBOX",
						   key:"ESPMR",
						   valueHigh: "",
						   valueLow:estadoPrecio
					   });
				 
			   }else{
				   MessageBox.error("Debe Ingresar un Estado de Precio");
			 
				   oGlobalBusyDialog.close();
				   return true;
			   }
			   

			   if(idPuertoIni && !idPuertoFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDPTO",
					valueHigh: idPuertoIni,
					valueLow: idPuertoIni
				});
				}
				if(!idPuertoIni && idPuertoFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"CDPTO",
						valueHigh: idPuertoFin,
						valueLow: idPuertoFin
					});
					}
					if(idPuertoFin && idPuertoIni){
						options.push({
							cantidad: "10",
							control:"MULTIINPUT",
							key:"CDPTO",
							valueHigh: idPuertoFin,
							valueLow: idPuertoIni
						});
						}	
			  
			   if(idPlantaIni && !idPlantaFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"WERKS",
					valueHigh: idPlantaIni,
					valueLow: idPlantaIni
				});
				}
				if(idPlantaFin && !idPlantaIni){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"CDPTA",
						valueHigh: idPlantaFin,
						valueLow: idPlantaFin
					});
					}
					if(idPlantaFin && idPlantaIni){
						options.push({
							cantidad: "10",
							control:"MULTIINPUT",
							key:"CDPTA",
							valueHigh: idPlantaFin,
							valueLow: idPlantaIni
						});
						}	
			   


			   if(idArmadorIni && !idArmadorFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDEMP",
					valueHigh: idArmadorIni,
					valueLow: idArmadorIni
				});
				}
				if(!idArmadorIni && idArmadorFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"CDEMP",
						valueHigh: idArmadorFin,
						valueLow: idArmadorFin
					});
					}
					if(idArmadorFin && idArmadorIni){
						options.push({
							cantidad: "10",
							control:"MULTIINPUT",
							key:"CDEMP",
							valueHigh: idArmadorFin,
							valueLow: idArmadorIni
						});
						}	





			   if(idEspecieIni && !idEspecieFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDSPC",
					valueHigh: idEspecieIni,
					valueLow: idEspecieIni
				});
				}
				if(!idEspecieIni && idEspecieFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"CDSPC",
						valueHigh: idEspecieFin,
						valueLow: idEspecieFin
					});
					}
					if(idEspecieIni && idEspecieFin){
						options.push({
							cantidad: "10",
							control:"MULTIINPUT",
							key:"CDSPC",
							valueHigh: idEspecieFin,
							valueLow: idEspecieIni
						});
						}	

						// if(JsonFechaIni.fechaIni =="" || JsonFechaIni.fechaIni2==""){
						// 	MessageBox.error("Debe ingresar fecha de inicio de vigencia y fecha fin de vigencia");
						// 	oGlobalBusyDialog.close();
						// 	return false;
		
						//   }

				if(fechaIniVigencia || fechaIniVigencia2){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"FIVIG",
						valueHigh: fechaIniVigencia2,
						valueLow:fechaIniVigencia
					});
				}
				if(fechaFinVigencia || fechaFinVigencia2){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"FFVIG",
						valueHigh: fechaFinVigencia2,
						valueLow:fechaFinVigencia
					});
				}
			  
			   //#endregion
			  
			   let body = {
				   "option": option,
				   "options": options,
				   "p_user": "FGARCIA"
			   }
			   console.log(body);
			   var indice=-1;
			  fetch(`${mainUrlServices}preciospesca/Leer`,
				   {
					   method: 'POST',
					   body: JSON.stringify(body)
				   })
				   .then(resp => resp.json()).then(data => {
					   var dataPrecio = data;
					   console.log(dataPrecio.str_ppc);
					   dataPrecio.str_ppc.total=dataPrecio.str_ppc.length;
						for(var i=0;i<dataPrecio.str_ppc.length;i++){
							if(dataPrecio.str_ppc[i].ESPMR=='L'){
								dataPrecio.str_ppc[i].ESPMRDESC = 'Liberado'
							}else{
								dataPrecio.str_ppc[i].ESPMRDESC = 'No Liberado'
							}
					   		if(dataPrecio.str_ppc[i].PRCMX ||dataPrecio.str_ppc[i].PRCTP){
								dataPrecio.str_ppc[i].PRCMX = parseFloat(dataPrecio.str_ppc[i].PRCMX).toFixed(2);
								dataPrecio.str_ppc[i].PRCTP = parseFloat(dataPrecio.str_ppc[i].PRCTP).toFixed(2);
								dataPrecio.str_ppc[i].PRVMN = parseFloat(dataPrecio.str_ppc[i].PRVMN).toFixed(2);
								dataPrecio.str_ppc[i].PRVTP = parseFloat(dataPrecio.str_ppc[i].PRVTP).toFixed(2);
					    	}
						}
						this.byId("title").setText("Lista de registros: "+dataPrecio.str_ppc.total);
						
					   this.getView().getModel("PoliticaPrecio").setProperty("/listaPolitica",dataPrecio.str_ppc);
					   
					   //this.getModel("reporteCala").setProperty("/items", data.str_ppc);
					   //this.getModel("reporteCala").refresh();
					   if(dataPrecio.str_ppc.length===0){
						this.byId("title").setText("Lista de registros: No se encontraron resultados");
					   }
						oGlobalBusyDialog.close();
				   }).catch(error => MessageBox.error("El servicio no está disponible  " )
				   );
				   

		   },
  
			  goToNewPrecio: function(){
				  this.getRouter().navTo("NuevoPoliticaPrecio");
			  },
  
			  goBackMain: function () {
				  this.getRouter().navTo("RouteApp");
				  location.reload();
			  },
			  filterGlobally : function(oEvent) {
				  var sQuery = oEvent.getParameter("query");
				  this._oGlobalFilter = null;
  
				  if (sQuery) {
					  this._oGlobalFilter = new Filter([
						  new Filter("CDPPC", FilterOperator.Contains, sQuery),
						  new Filter("DSZLT", FilterOperator.Contains, sQuery),
						  new Filter("DSPTO", FilterOperator.Contains, sQuery),
						  new Filter("DESCR", FilterOperator.Contains, sQuery),
						  new Filter("NAME1", FilterOperator.Contains, sQuery),
						  new Filter("FIVIG", FilterOperator.Contains, sQuery),
						  new Filter("FFVIG", FilterOperator.Contains, sQuery),
						  //new Filter("PRCMX", FilterOperator.Contains, sQuery),
						  //new Filter("PRCTP", FilterOperator.Contains, sQuery),
						  //new Filter("PRVMN", FilterOperator.Contains, sQuery),
						  //new Filter("PRVTP", FilterOperator.Contains, sQuery),
						  new Filter("DSSPC", FilterOperator.Contains, sQuery),
						  new Filter("WAERS", FilterOperator.Contains, sQuery),
						  new Filter("ESPMR", FilterOperator.Contains, sQuery)
						  
						  
					  ], false);
				  }
  
				  this._filter();
			  },
			  _filter : function() {
			  var oFilter = null;
  
			  if (this._oGlobalFilter && this._oPriceFilter) {
				  oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			  } else if (this._oGlobalFilter) {
				  oFilter = this._oGlobalFilter;
			  } else if (this._oPriceFilter) {
				  oFilter = this._oPriceFilter;
			  }
  
			  this.byId("table").getBinding().filter(oFilter, "Application");
		  },
		  handleSelectionChange: function(oEvent) {
			  var changedItem = oEvent.getParameter("changedItem");
			  var isSelected = oEvent.getParameter("selected");
			  console.log(changedItem);
			  var state = "Selected";
			  if (!isSelected) {
				  state = "Deselected";
			  }
  
			  MessageToast.show("Event 'selectionChange': " + state + " '" + changedItem.getKey() + "'", {
				  width: "auto",
				  animationDuration: 0
			  });
		  },
		  handleSelectionEstado: function(oEvent){
			  var selectedItems = oEvent.getParameter("selectedItems");
			  
			  console.log(selectedItems);
			  for (var i = 0; i < selectedItems.length; i++) {
				  
				  arrayEstado[i]=selectedItems[i].getKey();
				  
			  }
			  console.log(arrayEstado);
		  },
		  handleSelectionFinish: function(oEvent) {
			  var selectedItems = oEvent.getParameter("selectedItems");
			  
			  console.log(selectedItems);
			  for (var i = 0; i < selectedItems.length; i++) {
				  
				  array[i]=selectedItems[i].getKey();
				  
			  }
			  console.log(array);
			  
		  },
		  loadP: function(oEvent){
			  var num = this.byId("cboLitoral").getSelectedKeys();
				  let options=[];
				  for(var i=0;i<num;i++){
					  options.push({
						  cantidad: "10",
						  control:"MULTICOMBOBOX",
						  key:"CDZLT",
						  valueHigh: "",
						  valueLow:num[i]
					  });
				  }
				  console.log(options);
		  },
		  onDataExport:  function() {
			  var oExport = new Export({
				  exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
					separatorChar: ";",
					charset: "utf-8"
				  }),
				  //PoliticaPrecio>/listaPolitica
				  models: this.getView().getModel("PoliticaPrecio"),
				  rows:{path:""},
				  rows: { path: "/listaPolitica" },
				  columns: [
					{
					  name: "Código de Precio",
					  template: {
						content: "{CDPPC}"
					  }
					},
					{
					  name: "Zona de Pesca",
					  template: {
						content: "{DSZLT}"
					  }
					},
					{
					  name: "Puerto",
					  template: {
						content: "{DSPTO}"
					  }
					},
					{
					  name: "Planta",
					  template: {
						content: "{DESCR}"
					  }
					},
					{
					  name: "Armador Comercial",
					  template: {
						content: "{NAME1}"
					  }
					},
					
					{
					  name: "Fecha Inicio",
					  template: {
						content: "{FIVIG}"
					  }
					},
					{
					  name: "Fecha Fin",
					  template: {
						content: "{FFVIG}"
					  }
					},
					{
					  name: "Max",
					  template: {
						content: "{PRCMX}00"
					  }
					},
					{
					  name: "Tope",
					  template: {
						content: "{PRCTP}"
					  }
					},
					{
					  name: "Min",
					  template: {
						content: "{PRVMN}"
					  }
					},
					{
					  name: "Tope",
					  template: {
						content: "{PRVTP}"
					  }
					},
					{
					  name: "Especie",
					  template: {
						content: "{DSSPC}"
					  }
					},
					{
					  name: "Moneda",
					  template: {
						content: "{WAERS}"
					  }
					},
					{
					  name: "Estado",
					  template: {
						content: "{ESPMRDESC}"
					  }
					}
				  ]
				});
				oExport.saveFile("Politica de Precios").catch(function(oError) {
				  MessageBox.error("Error when downloading data. ..." + oError);
				}).then(function() {
				  oExport.destroy();
				});
			  },
			  _onOpenDialogArmador: function(evn) {
				
				this.popUp=evn;
				this.getView().getModel("Armador").setProperty("/listaArmador","");
				this._getDialogArmador().open();
			},
	
			_onCloseDialogArmador: function() {
				this._getDialogArmador().close();
				sap.ui.getCore().byId("idRuc2").setValue("");
				sap.ui.getCore().byId("idDescripcion").setValue("");
				sap.ui.getCore().byId("idCuentaProveedor").setValue("");
				sap.ui.getCore().byId("idListaArmador").setText("Lista de registros:");
				
			},
	
			_getDialogArmador : function () {
				if (!this._oDialogArmador) {
					this._oDialogArmador = sap.ui.xmlfragment("com.tasa.politicadeprecios.view.DlgArmador", this.getView().getController());
					this.getView().addDependent(this._oDialogArmador);
					sap.ui.getCore().byId("idAciertosPop").setValue("200");
				}
				
				return this._oDialogArmador;
			},
			buscar: function(evt){
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.Armador.sPath.split("/")[2];
				console.log(indices);
				var data = this.getView().getModel("Armador").oData.listaArmador[indices].LIFNR;
				if(this.popUp==="popOne"){
					this.byId("idArmadorIni").setValue(data);
				}else if(this.popUp==="popTwo"){
					this.byId("idArmadorFin").setValue(data);
				}
				
				this._onCloseDialogArmador();	
			},
			
			
		});
	});
