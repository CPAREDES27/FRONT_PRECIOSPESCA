sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	 function (BaseController,Controller,JSONModel,History,ExportTypeCSV,Export,Filter,FilterOperator,BusyIndicator,MessageBox,exportLibrary, Spreadsheet) {
		"use strict";
		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var JsonFechaIni={
			fechaIni:"",
			fechaIni2:""
		};
		var popEmb="";
		var popUp="";
		var EdmType = exportLibrary.EdmType;
		return BaseController.extend("tasa.com.consultapreciospesca.controller.App", {
			onInit: function () {
				let ViewModel= new JSONModel(
					{}
					);
					this.setModel(ViewModel, "consultaMareas");
					this.currentInputEmba = "";
						this.primerOption = [];
						this.segundoOption = [];
						this.currentPage = "";
						this.lastPage = "";
					var oGlobalBusyDialog = new sap.m.BusyDialog();
					this.setModel(ViewModel,"litoral");
					this.setModel(ViewModel,"precio");
					this.setModel(ViewModel,"castigo");
					this.setModel(ViewModel,"reporteCala")
					this.loadComboPrecio(); 
					this.listPlanta();
					this.loadIndicadorP();
					
			},

			listaArmador: function(){
				oGlobalBusyDialog.open();
				var idAciertos = 	sap.ui.getCore().byId("idAciertosPop").getValue();
				var idRuc = 	sap.ui.getCore().byId("idRuc2").getValue();
				var idDescripcion = 	sap.ui.getCore().byId("idDescripcion").getValue();
				var idCuentaProveedor =	sap.ui.getCore().byId("idCuentaProveedor").getValue();
				
				console.log(idAciertos);
				console.log(idRuc);
				console.log(idDescripcion);
				console.log(idCuentaProveedor);
				var body={
					"delimitador": "|",
					"fields": [
					  
					],
					"no_data": "",
					"option": [
					 
					],
					"options": [
						{
							"cantidad": "10",
							"control": "INPUT",
							"key": "LIFNR",
							"valueHigh": "",
							"valueLow": idCuentaProveedor,
						  },
						  {
							"cantidad": "10",
							"control": "INPUT",
							"key": "NAME1",
							"valueHigh": "",
							"valueLow": idDescripcion,
						  },
						  {
							"cantidad": "10",
							"control": "INPUT",
							"key": "STCD1",
							"valueHigh": "",
							"valueLow": idRuc,
						  }
					  
					],
					"order": "",
					"p_user": "FGARCIA",
					"rowcount": idAciertos,
					"rowskips": 0,
					"tabla": "LFA1"
				  }
				  fetch(`${mainUrlServices}General/Read_table/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						var dataPuerto=data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Armador").setProperty("/listaArmador",dataPuerto));
						sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: "+dataPuerto.length);
						if(dataPuerto.length<=0){
							sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: No se encontraron resultados");
						}
						oGlobalBusyDialog.close();
					  }).catch(function(error){
							if(error){
								MessageBox.error(error.message);
								oGlobalBusyDialog.close();
							}
					  });
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
   
			
				if(id==="application-consultapreciospesca-display-component---App--idFechaIniVigencia")
				{
					JsonFechaIni={
						fechaIni:fechaIni,
						fechaIni2:fechaIni2
					}
				}
		  
			   
			},
			generateFecha: function(date){
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
			
			
		  
			listPlanta: function(){
				oGlobalBusyDialog.open();
				var dataPlantas={
					"nombreAyuda": "BSQPLANTAS"
				};
				  fetch(`${mainUrlServices}General/AyudasBusqueda`,
				  {
					  method: 'POST',
					  body: JSON.stringify(dataPlantas)
				  })
				  .then(resp => resp.json()).then(data => {
					var dataPuerto=data.data;
					
					console.log(this.getView().getModel("Planta").setProperty("/listaPlanta",dataPuerto));
					oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
				  );
				
			},
			limpiarFiltros: function(){
				this.byId("idPlantaIni").setValue("");
				this.byId("idPlantaFin").setValue("");
				this.byId("idArmadorIni").setValue("");
				this.byId("idArmadorFin").setValue("");
				this.byId("embarcacionLow").setValue("");
				this.byId("embarcacionHigh").setValue("");
				this.byId("idFechaIniVigencia").setValue("");
				this.byId("idEstado").setValue("");
				this.byId("idEstadoCastigo").setValue("");

			},
			loadComboPrecio: function(){
				oGlobalBusyDialog.open();
				var ZDO_PRECIO=null;
				var ZDO_ZESPRC=null;
				const bodyDominio = {
						"dominios": [
							{
							"domname": "ZESCSG",
							"status": "A"
							},
							{
								"domname": "ZESPRC",
								"status": "A"
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
							
							ZDO_PRECIO= data.data.find(d => d.dominio == "ZESPRC").data;
							ZDO_ZESPRC=data.data.find(d => d.dominio == "ZESCSG").data;
							
							this.getModel("precio").setProperty("/ZDO_PRECIO", ZDO_PRECIO);
							this.getModel("castigo").setProperty("/ZESPRC", ZDO_ZESPRC);
							oGlobalBusyDialog.close();
						}).catch(error => console.log(error)
						);
			},
			 goBackMain: function () {
					this.getRouter().navTo("RouteApp");
					location.reload();
			},
			castFecha: function(idFechaInicio){
				var fechaIni = new Date(idFechaInicio);
				var mes = fechaIni.getMonth()+1;
				var day= fechaIni.getDate();
				var anio = fechaIni.getFullYear();
				if(mes<10){
					mes=this.zeroFill(mes,2);
				}
				if(day<10){
					day=this.zeroFill(day,2);
				}
				return anio+""+mes+""+day;
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
			
			loadTablaPreciosAcopio: function(){
				oGlobalBusyDialog.open();
				let options=[];
				var idPlantaIni=this.byId("idPlantaIni").getValue();
				var idPlantaFin = this.byId("idPlantaFin").getValue();
				var idArmadorIni = this.byId("idArmadorIni").getValue();
				var idArmadorFin = this.byId("idArmadorFin").getValue();
				var idEmbarcacionIni = this.byId("embarcacionLow").getValue();
				var idEmbarcacionFin = this.byId("embarcacionHigh").getValue();
				var idEstado = this.byId("idEstado").getSelectedKey();
				var idEstadoCastigo= this.byId("idEstadoCastigo").getSelectedKey();
				var idFechaZarpe=this.byId("idFechaIniVigencia").getValue();
				var idFechaIni="";
				var idFechaF="";
				var fechaEstado=true;
				if(idFechaZarpe==="" || idFechaZarpe===null){
					idFechaIni = "";
					idFechaF = "";	
					fechaEstado=false;
				}else{
					fechaEstado=true;
					idFechaIni = this.byId("idFechaIniVigencia").mProperties.dateValue;
					idFechaF = this.byId("idFechaIniVigencia").mProperties.secondDateValue;
					var idFechaIni=this.castFecha(idFechaIni);
					var idFechaF=this.castFecha(idFechaF);
				}


			if(!idFechaZarpe){
				MessageBox.error("Debe ingresar una fecha de zarpe");
				oGlobalBusyDialog.close();
				return false;
			}
				if(idEstado){
					options.push({
						cantidad: "10",
						control:"COMBOBOX",
						key:"ESPRC",
						valueHigh:"",
						valueLow:idEstado
					});
				}
				if(idEstadoCastigo){
					options.push({
						cantidad: "10",
						control:"COMBOBOX",
						key:"ESCSG",
						valueHigh:"",
						valueLow:idEstadoCastigo
					});
				}
				if(idPlantaIni && !idPlantaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"WERKS",
						valueHigh: idPlantaIni,
						valueLow:idPlantaIni
					});
				}
				if(!idPlantaIni && idPlantaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"WERKS",
						valueHigh: idPlantaFin,
						valueLow:idPlantaFin
					});
				}
				if(idPlantaIni && idPlantaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"WERKS",
						valueHigh: idPlantaFin,
						valueLow:idPlantaIni
					});
				}
			if(idArmadorIni && !idArmadorFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"LIFNR",
						valueHigh: idArmadorIni,
						valueLow:idArmadorIni
					});
			}
			if(!idArmadorIni && idArmadorFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"LIFNR",
					valueHigh: idArmadorFin,
					valueLow:idArmadorFin
				});
			}
			if(idArmadorIni && idArmadorFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"LIFNR",
					valueHigh: idArmadorFin,
					valueLow:idArmadorIni
				});
			}
			if(idEmbarcacionIni && !idEmbarcacionFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"CDEMB",
						valueHigh: idEmbarcacionIni,
						valueLow:idEmbarcacionIni
					});
			}
			if(!idEmbarcacionFin && idEmbarcacionFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDEMB",
					valueHigh: idEmbarcacionFin,
					valueLow:idEmbarcacionFin
				});
			}
			if(idEmbarcacionIni && idEmbarcacionFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDEMB",
					valueHigh: idEmbarcacionFin,
					valueLow:idEmbarcacionIni
				});
			}
			if(idFechaIni || idFechaF){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"FECCONMOV",
						valueHigh: idFechaF,
						valueLow:idFechaIni
					});
			}
			// var conPrecio="";
			// 	console.log(idEstado);
			// 	if(idEstado=="L"){
			// 		conPrecio="(PRCOM IS NOT NULL AND PRCOM > 0)"
			// 	}else if(idEstado=="N"){
			// 		conPrecio="(PRCOM IS NULL OR PRCOM = 0)"
			// 	}
				let body = {
					
					"option": [
					   
					],
					"options": options,
					"p_user": "FGARCIA"
					}
					console.log(body);
					var indice=-1;
				   fetch(`${mainUrlServices}preciospesca/ConsultarProb`,
						{
							method: 'POST',
							body: JSON.stringify(body)
						})
						.then(resp => resp.json()).then(data => {
							 
							
								
									//let ViewModel= new JSONModel();
									var dataPrecio = data;
									console.log(dataPrecio);
									this.getView().getModel("Acopio").setProperty("/listaPrecio",dataPrecio.str_app);
									this.byId("title").setText("Lista de registros: "+dataPrecio.str_app.length);
									if(dataPrecio.str_app.length<=0){
										this.byId("title").setText("Lista de registros: No se encontraron resultados");
									}
									
									//console.log(this.getView().getModel());
									
								
						
							oGlobalBusyDialog.close();
	
						}).catch(error => console.log(error)
						);
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
			buscarEmbarca: function(evt){
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
				console.log(indices);
				var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
				if(this.popEmb==="popEmb"){
					this.byId("embarcacionLow").setValue(data);
				}else if(this.popEmb==="popEmb2"){
					this.byId("embarcacionHigh").setValue(data);
				}
				this._onCloseDialogEmbarcacion();
				
			},
			_onOpenDialogEmbarcacion: function(popup) {

				this.popEmb=popup;
				this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion","");
				this._getDialogEmbarcacion().open();
				
				},
	
				_onCloseDialogEmbarcacion: function() {
					this._getDialogEmbarcacion().close();
				},
	
				_getDialogEmbarcacion : function () {
					if (!this._oDialogEmbarcacion) {
						this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.consultapreciospesca.view.DlgEmbarcacion", this.getView().getController());
						this.getView().addDependent(this._oDialogEmbarcacion);
					}
					sap.ui.getCore().byId("idEmbarcacion").setValue("");
				sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
				sap.ui.getCore().byId("idMatricula").setValue("");
				sap.ui.getCore().byId("idRuc").setValue("");
				sap.ui.getCore().byId("idArmador").setValue("");
					return this._oDialogEmbarcacion;
				},
				listaEmbarcacion: function(){
					oGlobalBusyDialog.open();
					console.log("BusquedaEmbarca");
					var idEmbarcacion =sap.ui.getCore().byId("idEmbarcacion").getValue();
					var idEmbarcacionDesc =sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
					var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
					var idRuc =sap.ui.getCore().byId("idRuc").getValue();
					var idArmador =sap.ui.getCore().byId("idArmador").getValue();
					var idPropiedad = sap.ui.getCore().byId("idPropiedad").getSelectedKey();
	
					var options=[];
					var options2=[];
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "ESEMB",
						"valueHigh": "",
						"valueLow": "O"
					})
					if(idEmbarcacion){
						options.push({
							"cantidad": "20",
							"control": "COMBOBOX",
							"key": "CDEMB",
							"valueHigh": "",
							"valueLow": idEmbarcacion
							
						});
					}
					if(idEmbarcacionDesc){
						options.push({
							"cantidad": "20",
							"control": "COMBOBOX",
							"key": "NMEMB",
							"valueHigh": "",
							"valueLow": idEmbarcacionDesc
							
						});
					}
					if(idMatricula){
						options.push({
							"cantidad": "20",
							"control": "COMBOBOX",
							"key": "MREMB",
							"valueHigh": "",
							"valueLow": idMatricula
						})
					}
					// if(idPropiedad){
					// 	options.push({
					// 		"cantidad": "20",
					// 		"control": "COMBOBOX",
					// 		"key": "INPRP",
					// 		"valueHigh": "",
					// 		"valueLow": idPropiedad
					// 	})
					// }
					if(idRuc){
						options2.push({
							"cantidad": "20",
							"control": "COMBOBOX",
							"key": "STCD1",
							"valueHigh": "",
							"valueLow": idRuc
						})
					}
					if(idArmador){
						options2.push({
							"cantidad": "20",
							"control": "COMBOBOX",
							"key": "NAME1",
							"valueHigh": "",
							"valueLow": idArmador
						})
					}
					
					var body={
						"option": [
						  
						],
						"option2": [
						  
						],
						"options": options,
						"options2": options2,
						"p_user": "BUSQEMB"
					  }
					  console.log(body);
					fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
						  {
							  method: 'POST',
							  body: JSON.stringify(body)
						  })
						  .then(resp => resp.json()).then(data => {
							  console.log(data);
							var dataPuerto=data.data;
							console.log(dataPuerto);
							console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto));
							
								sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: "+dataPuerto.length);
							if(dataPuerto.length<=0){
								sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: No se encontraron resultados");
							}
							oGlobalBusyDialog.close();
						  }).catch(error => console.log(error)
					);
				},
				loadIndicadorP: function(){
					oGlobalBusyDialog.open();
					var ZINPRP=null;
					var body={
						"dominios": [
						  {
							"domname": "ZINPRP",
							"status": "A"
						  }
						]
					}
					fetch(`${mainUrlServices}dominios/Listar/`,
						  {
							  method: 'POST',
							  body: JSON.stringify(body)
						  })
						  .then(resp => resp.json()).then(data => {
							console.log(data);
								
							ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
								
								this.getModel("Propiedad").setProperty("/listaPropiedad", ZINPRP);
								oGlobalBusyDialog.close();
						  }).catch(error => console.log(error)
					);
	
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
						this._oDialogArmador = sap.ui.xmlfragment("tasa.com.consultapreciospesca.view.DlgArmador", this.getView().getController());
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
				onDataExport:  function() {
					var oExport = new Export({
						exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
						  separatorChar: ";",
						  charset: "utf-8"
						}),
						//PoliticaPrecio>/listaPolitica
						models: this.getView().getModel("Acopio"),
						rows:{path:""},
						rows: { path: "/listaPrecio" },
						columns: [
						  {
							name: "Centro",
							template: {
							  content: "{WERKS}"
							}
						  },
						  {
							name: "Matricula",
							template: {
							  content: "{MREMB}"
							}
						  },
						  {
							name: "Embarcacion",
							template: {
							  content: "{NMEMB}"
							}
						  },
						  {
							name: "Armador",
							template: {
							  content: "{NAME1}"
							}
						  },
						  
						  {
							name: "Fecha prod",
							template: {
							  content: "{FECCONMOV}"
							}
						  },
						  {
							name: "Cant. descargada",
							template: {
							  content: "{CNPDS}"
							}
						  },
						  {
							name: "Compra",
							template: {
							  content: "{PRCOM}"
							}
						  },
						  {
							name: "Bonif",
							template: {
							  content: "{BONIF}"
							}
						  },
						  {
							name: "Venta",
							template: {
							  content: "{PRVEN}"
							}
						  },
						  {
							name: "Moneda",
							template: {
							  content: "{DESC_WAERS}"
							}
						  },
						  {
							name: "Estado",
							template: {
							  content: "{DESC_ESPRC}"
							}
						  },
						  {
							name: "% Prop",
							template: {
							  content: "{PCSPP}"
							}
						  },
						  {
							name: "% Def",
							template: {
							  content: "{PCCSG}"
							}
						  },
						  {
							name: "Estado",
							template: {
							  content: "{DESC_ESCSG}"
							}
						  
						  },
						  {
							name: "Obs. super.",
							template: {
							  content: "{OBCDF}"
							}
						  
						  },
						  {
							name: "Obs. ger.",
							template: {
							  content: "{OBCPP}"
							}
						  
						  },
						  {
							name: "Calidad",
							template: {
							  content: "{CALIDAD}"
							}
						  },
						  {
							name: "% Juveniles",
							template: {
							  content: "{JUVEN}"
							}
						  },
						  {
							name: "TVN",
							template: {
							  content: "{TVN}"
							}
						  },
						  {
							name: "TDC",
							template: {
							  content: "{TDC}"
							}
						  },
						  {
							name: "Obs. calidad",
							template: {
							  content: "{OBCPP}"
							}
						  },
						  {
							name: "Orden compra",
							template: {
							  content: "{EBELN}"
							}
						  },
						  {
							name: "Factura",
							template: {
							  content: "{BELNR}"
							}
						  },
						  {
							name: "Doc. Fi",
							template: {
							  content: "{DOCFI}"
							}
						  },
						  {
							name: "Doc. Anulación",
							template: {
							  content: "{DOCFI2}"
							}
						  }
						]
					  });
					  oExport.saveFile("Precios de Acopio").catch(function(oError) {
						MessageBox.error("Error when downloading data. ..." + oError);
					  }).then(function() {
						oExport.destroy();
					  });
					},
					onSearch: function (oEvent) {
						// add filter for search
						var aFilters = [];
						var sQuery = oEvent.getSource().getValue();
						if (sQuery && sQuery.length > 0) {
							var filter = new Filter([
								new Filter("DOCFI2", FilterOperator.Contains, sQuery),
									new Filter("DOCFI", FilterOperator.Contains, sQuery),
									new Filter("BELNR", FilterOperator.Contains, sQuery),
									new Filter("EBELN", FilterOperator.Contains, sQuery),
									new Filter("OBCPP", FilterOperator.Contains, sQuery),
									new Filter("OBCDF", FilterOperator.Contains, sQuery),
									new Filter("DESC_ESCSG", FilterOperator.Contains, sQuery),
									// new Filter("PCCSG", FilterOperator.Contains, sQuery),
									// new Filter("PCSPP", FilterOperator.Contains, sQuery),
									new Filter("DESC_ESPRC", FilterOperator.Contains, sQuery),
									new Filter("DESC_WAERS", FilterOperator.Contains, sQuery),
									new Filter("CALIDA", FilterOperator.Contains, sQuery),
									new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
									new Filter("NAME1", FilterOperator.Contains, sQuery),
									new Filter("NMEMB", FilterOperator.Contains, sQuery),
									new Filter("MREMB", FilterOperator.Contains, sQuery),
									new Filter("WERKS", FilterOperator.Contains, sQuery)
							
							]);
							aFilters.push(filter);
						}
			
						// update list binding
						var oList = this.byId("table");
						var oBinding = oList.getBinding("rows");
						oBinding.filter(aFilters, "Application");
					},
					filterGlobally : function(oEvent) {
					  var sQuery = oEvent.getParameter("query");
					  this._oGlobalFilter = null;
			
							if (sQuery) {
								this._oGlobalFilter = new Filter([
									new Filter("DOCFI2", FilterOperator.Contains, sQuery),
									new Filter("DOCFI", FilterOperator.Contains, sQuery),
									new Filter("BELNR", FilterOperator.Contains, sQuery),
									new Filter("EBELN", FilterOperator.Contains, sQuery),
									new Filter("OBCPP", FilterOperator.Contains, sQuery),
									new Filter("OBCDF", FilterOperator.Contains, sQuery),
									new Filter("DESC_ESCSG", FilterOperator.Contains, sQuery),
									// new Filter("PCCSG", FilterOperator.Contains, sQuery),
									// new Filter("PCSPP", FilterOperator.Contains, sQuery),
									new Filter("DESC_ESPRC", FilterOperator.Contains, sQuery),
									new Filter("DESC_WAERS", FilterOperator.Contains, sQuery),
									new Filter("CALIDA", FilterOperator.Contains, sQuery),
									new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
									new Filter("NAME1", FilterOperator.Contains, sQuery),
									new Filter("NMEMB", FilterOperator.Contains, sQuery),
									new Filter("MREMB", FilterOperator.Contains, sQuery),
									new Filter("WERKS", FilterOperator.Contains, sQuery)									
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
				onSelectEmba: function(evt){
					var objeto = evt.getParameter("rowContext").getObject();
					if (objeto) {
						var cdemb = objeto.CDEMB;
						if (this.currentInputEmba.includes("embarcacionLow")) {
							this.byId("embarcacionLow").setValue(cdemb);
						}else if(this.currentInputEmba.includes("embarcacionHigh")){
							this.byId("embarcacionHigh").setValue(cdemb);
						}
						this.getDialog().close();
					}
				},
		
				onSearchEmbarcacion: function(evt){
					BusyIndicator.show(0);
					var idEmbarcacion = sap.ui.getCore().byId("idEmba").getValue();
					var idEmbarcacionDesc = sap.ui.getCore().byId("idNombEmba").getValue();
					var idMatricula = sap.ui.getCore().byId("idMatricula").getValue();
					var idRuc = sap.ui.getCore().byId("idRucArmador").getValue();
					var idArmador = sap.ui.getCore().byId("idDescArmador").getValue();
					var idPropiedad = sap.ui.getCore().byId("indicadorPropiedad").getSelectedKey();
					var options = [];
					var options2 = [];
					let embarcaciones = [];
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "ESEMB",
						"valueHigh": "",
						"valueLow": "O"
					})
					if (idEmbarcacion) {
						options.push({
							"cantidad": "20",
							"control": "INPUT",
							"key": "CDEMB",
							"valueHigh": "",
							"valueLow": idEmbarcacion
		
						});
					}
					if (idEmbarcacionDesc) {
						options.push({
							"cantidad": "20",
							"control": "INPUT",
							"key": "NMEMB",
							"valueHigh": "",
							"valueLow": idEmbarcacionDesc.toUpperCase()
		
						});
					}
					if (idMatricula) {
						options.push({
							"cantidad": "20",
							"control": "INPUT",
							"key": "MREMB",
							"valueHigh": "",
							"valueLow": idMatricula
						});
					}
					if (idPropiedad) {
						options.push({
							"cantidad": "20",
							"control": "COMBOBOX",
							"key": "INPRP",
							"valueHigh": "",
							"valueLow": idPropiedad
						});
					}
					if (idRuc) {
						options2.push({
							"cantidad": "20",
							"control": "INPUT",
							"key": "STCD1",
							"valueHigh": "",
							"valueLow": idRuc
						});
					}
					if (idArmador) {
						options2.push({
							"cantidad": "20",
							"control": "INPUT",
							"key": "NAME1",
							"valueHigh": "",
							"valueLow": idArmador.toUpperCase()
						});
					}
		
					this.primerOption = options;
					this.segundoOption = options2;
		
					var body = {
						"option": [
		
						],
						"option2": [
		
						],
						"options": options,
						"options2": options2,
						"p_user": "BUSQEMB",
						//"p_pag": "1" //por defecto la primera parte
					};
		
					fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
						{
							method: 'POST',
							body: JSON.stringify(body)
						})
						.then(resp => resp.json()).then(data => {
							console.log("Emba: ", data);
							embarcaciones = data.data;
		
							this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
							this.getModel("consultaMareas").refresh();
		
							if (!isNaN(data.p_totalpag)) {
								if (Number(data.p_totalpag) > 0) {
									sap.ui.getCore().byId("goFirstPag").setEnabled(true);
									sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
									sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
									sap.ui.getCore().byId("goLastPag").setEnabled(true);
									sap.ui.getCore().byId("goNextPag").setEnabled(true);
									var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
									this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
									var numPag = Number(data.p_totalpag) + 1;
									var paginas = [];
									for (let index = 1; index < numPag; index++) {
										paginas.push({
											numero: index
										});
									}
									this.getModel("consultaMareas").setProperty("/NumerosPaginacion", paginas);
									sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
									this.currentPage = "1";
									this.lastPage = data.p_totalpag;
								} else {
									var tituloTablaEmba = "Página 1/1";
									this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
									this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
									sap.ui.getCore().byId("goFirstPag").setEnabled(false);
									sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
									sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
									sap.ui.getCore().byId("goLastPag").setEnabled(false);
									sap.ui.getCore().byId("goNextPag").setEnabled(false);
									this.currentPage = "1";
									this.lastPage = data.p_totalpag;
								}
							}
		
		
							//sap.ui.getCore().byId("comboPaginacion").setVisible(true);
		
							BusyIndicator.hide();
						}).catch(error => console.log(error));
				},
		
		
				onChangePag: function (evt) {
					var id = evt.getSource().getId();
					var oControl = sap.ui.getCore().byId(id);
					var pagina = oControl.getSelectedKey();
					this.currentPage = pagina;
					this.onNavPage();
				},
		
				onSetCurrentPage: function (evt) {
					var id = evt.getSource().getId();
					if (id == "goFirstPag") {
						this.currentPage = "1";
					} else if (id == "goPreviousPag") {
						if (!isNaN(this.currentPage)) {
							if (this.currentPage != "1") {
								var previousPage = Number(this.currentPage) - 1;
								this.currentPage = previousPage.toString();
							}
						}
					} else if (id == "goNextPag") {
						if (!isNaN(this.currentPage)) {
							if (this.currentPage != this.lastPage) {
								var nextPage = Number(this.currentPage) + 1;
								this.currentPage = nextPage.toString();
							}
						}
					} else if (id == "goLastPag") {
						this.currentPage = this.lastPage;
					}
					this.onNavPage();
				},
		
				onNavPage: function () {
					BusyIndicator.show(0);
					let embarcaciones = [];
					var body = {
						"option": [
		
						],
						"option2": [
		
						],
						"options": this.primerOption,
						"options2": this.segundoOption,
						"p_user": "BUSQEMB",
						"p_pag": this.currentPage
					};
		
					fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
						{
							method: 'POST',
							body: JSON.stringify(body)
						})
						.then(resp => resp.json()).then(data => {
							console.log("Emba: ", data);
							embarcaciones = data.data;
		
							this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
							this.getModel("consultaMareas").refresh();
							var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
							this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
							sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
							BusyIndicator.hide();
						}).catch(error => console.log(error));
				},
				getDialog: function(){
					if (!this.oDialog) {
						this.oDialog = sap.ui.xmlfragment("tasa.com.consultapreciospesca.view.Embarcacion", this);
						this.getView().addDependent(this.oDialog);
					}
					return this.oDialog;
				},
				onOpenEmba: function(evt){
					this.currentInputEmba = evt.getSource().getId();
					this.getDialog().open();
				},
		
				onCerrarEmba: function(){
					this.clearFilterEmba();
					this.getDialog().close();
					this.getModel("consultaMareas").setProperty("/embarcaciones", "");
					this.getModel("consultaMareas").setProperty("/TituloEmba", "");
					sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
					sap.ui.getCore().byId("goFirstPag").setEnabled(false);
					sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
					sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
					sap.ui.getCore().byId("goLastPag").setEnabled(false);
					sap.ui.getCore().byId("goNextPag").setEnabled(false);
					sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
				},
				clearFilterEmba: function(){
					sap.ui.getCore().byId("idEmba").setValue("");
					sap.ui.getCore().byId("idNombEmba").setValue("");
					sap.ui.getCore().byId("idRucArmador").setValue("");
					sap.ui.getCore().byId("idMatricula").setValue("");
					sap.ui.getCore().byId("indicadorPropiedad").setValue("");
					sap.ui.getCore().byId("idDescArmador").setValue("");
				},
				buscarEmbarca: function(evt){
					console.log(evt);
					var indices = evt.mParameters.listItem.oBindingContexts.consultaMareas.sPath.split("/")[2];
					console.log(indices);
				
					var data = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].CDEMB;
					if (this.currentInputEmba.includes("embarcacionLow")) {
						this.byId("embarcacionLow").setValue(data);
					}else if(this.currentInputEmba.includes("embarcacionHigh")){
						this.byId("embarcacionHigh").setValue(data);
					}
					this.onCerrarEmba();
					
				},
				limpiarFiltro: function(){
							
					sap.ui.getCore().byId("idRuc2").setValue("");
					sap.ui.getCore().byId("idDescripcion").setValue("");
					sap.ui.getCore().byId("idCuentaProveedor").setValue("");
					
				},
				createColumnConfig: function() {
					return [
						{
							label: 'Centro',
							property: 'WERKS' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Matricula',
							property: 'MREMB' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Embarcacion',
							property: 'NMEMB' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Armador',
							property: 'NAME1' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Armador Comercial',
							property: 'NAME1' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Fecha prod',
							property: 'FECCONMOV' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Cant. descargada',
							property: 'CNPDS' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Compra',
							property: 'PRCOM' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Bonificación',
							property: 'BONIF' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Venta',
							property: 'PRVEN' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Moneda',
							property: 'DESC_WAERS' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Estado',
							property: 'DESC_ESPRC' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: '% Prop',
							property: 'PCSPP' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: '% Def',
							property: 'PCCSG' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Estado',
							property: 'DESC_ESCSG' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Obs. super.',
							property: 'OBCDF' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Obs. ger.',
							property: 'OBCPP' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Calidad',
							property: 'DESC_CALIDA' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: '% Juveniles',
							property: 'JUVEN' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'TVN',
							property: 'TVN' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'TDC',
							property: 'TDC' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Obs. calidad',
							property: 'OBCPP' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Orden compra',
							property: 'EBELN' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Factura',
							property: 'BELNR' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Doc. Fi',
							property: 'DOCFI' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Doc. Anulación',
							property: 'DOCFI2' ,
							type: EdmType.String,
							scale: 2
						}
						];
				},
				onExport: function() {
					var aCols, aProducts, oSettings, oSheet;
		
					aCols = this.createColumnConfig();
					aProducts = this.getView().getModel("Acopio").getProperty('/listaPrecio');
		
					oSettings = {
						
						workbook: { 
							columns: aCols,
							context: {
								application: 'Debug Test Application',
								version: '1.95.0',
								title: 'Some random title',
								modifiedBy: 'John Doe',
								metaSheetName: 'Custom metadata'
							}
							
						},
						dataSource: aProducts,
						fileName:"REPORTE CONSULTA PRECIOS DE PESCA"
					};
		
					oSheet = new Spreadsheet(oSettings);
					oSheet.build()
						.then( function() {
							MessageToast.show('El Archivo ha sido exportado correctamente');
						})
						.finally(oSheet.destroy);
				},
				
				onSearchHelp:function(oEvent){
					let sIdInput = oEvent.getSource().getId(),
					oModel = this.getModel(),
					nameComponent="busqembarcaciones",
					idComponent="busqembarcaciones",
					urlComponent=HOST+"/9acc820a-22dc-4d66-8d69-bed5b2789d3c.AyudasBusqueda.busqembarcaciones-1.0.0",
					oView = this.getView(),
					oInput = this.getView().byId(sIdInput);
					oModel.setProperty("/input",oInput);
		
					if(!this.DialogComponent){
						this.DialogComponent = new sap.m.Dialog({
							title:"Búsqueda de embarcaciones",
							icon:"sap-icon://search",
							state:"Information",
							endButton:new sap.m.Button({
								icon:"sap-icon://decline",
								text:"Cerrar",
								type:"Reject",
								press:function(oEvent){
									this.onCloseDialog(oEvent);
								}.bind(this)
							})
						});
						oView.addDependent(this.DialogComponent);
						oModel.setProperty("/idDialogComp",this.DialogComponent.getId());
					}
		
					let comCreateOk = function(oEvent){
						BusyIndicator.hide();
					};
		
					
					if(this.DialogComponent.getContent().length===0){
						BusyIndicator.show(0);
						let oComponent = new sap.ui.core.ComponentContainer({
							id:idComponent,
							name:nameComponent,
							url:urlComponent,
							settings:{},
							componentData:{},
							propagateModel:true,
							componentCreated:comCreateOk,
							height:'100%',
							// manifest:true,
							async:false
						});
		
						this.DialogComponent.addContent(oComponent);
					}
					
					this.DialogComponent.open();
				},
				onCloseDialog:function(oEvent){
					oEvent.getSource().getParent().close();
				}
			
		});
	});
