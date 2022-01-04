sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	 function (BaseController,Controller,JSONModel,History,MessageToast,MessageBox,ExportTypeCSV,Export,Filter,FilterOperator,BusyIndicator,exportLibrary, Spreadsheet) {
		"use strict";
		//const this.onLocation() = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var JsonFechaIni={
			fechaIni:"",
			fechaIni2:""
		};
		var popUp="";
		var popEmb="";
		var EdmType = exportLibrary.EdmType;
		var usuario="";
		return BaseController.extend("tasa.com.estadodeprecios.controller.App", {
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
					this.listPlanta();
					
					this.loadIndicadorP();
					this.byId("idAciertos").setValue("200");
					this._getCurrentUser();

				},
				_getCurrentUser: async function(){
						let oUshell = sap.ushell,
						oUser={};
						if(oUshell){
							let  oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
							let sEmail = oUserInfo.getEmail().toUpperCase(),
							sName = sEmail.split("@")[0],
							sDominio= sEmail.split("@")[1];
							if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
								oUser = {
									name:sName
								}
							}else{
							oUser = {
							name: "FGARCIA"
							}
						}
							
						this.usuario=oUser.name;
						console.log(this.usuario);
				},

			goBackMain: function () {
				   this.getRouter().navTo("RouteApp");
				   location.reload();
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

			
			 if(id==="application-estadodeprecios-display-component---App--idFechaIniVigencia")
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
			var dataPlantas={
				"nombreAyuda": "BSQPLANTAS"
			};
			  fetch(`${ this.onLocation()}General/AyudasBusqueda`,
			  {
				  method: 'POST',
				  body: JSON.stringify(dataPlantas)
			  })
			  .then(resp => resp.json()).then(data => {
				var dataPuerto=data.data;
				
				console.log(this.getView().getModel("Planta").setProperty("/listaPlanta",dataPuerto));
			  }).catch(error => console.log(error)
			  );
			
		},
		castFechas: function(fecha){
			var arrayFecha=fecha.split("/");
			console.log(arrayFecha);
			var fechas = arrayFecha[2]+""+arrayFecha[1]+""+arrayFecha[0];
			return fechas;
		},
		   loadTablaPreciosAcopio: function(){
			oGlobalBusyDialog.open();
			var idPlantaIni= this.byId("idPlantaIni").getValue();
			var idPlantaFin= this.byId("idPlantaFin").getValue();
			var idArmadorIni= this.byId("idArmadorIni").getValue();
			var idArmadorFin= this.byId("idArmadorFin").getValue();
			var idEmbarcacionIni= this.byId("embarcacionLow").getValue();
			var idEmbarcacionFin= this.byId("embarcacionHigh").getValue();
			var idAciertos =this.byId("idAciertos").getValue();
			var fechaIni= this.byId("idFechaIniVigencia").getValue();
			console.log(fechaIni);
			var error=""
			var estado=true;
			if(!fechaIni){
			 error="Debe ingresar una fecha de inicio de vigencia\n";
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
			if(idAciertos===""){
				MessageBox.error("Debe ingresar cantidad de aciertos");
				oGlobalBusyDialog.close();
				return false;
			}
			let options=[];


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
		if(!idEmbarcacionIni && idEmbarcacionFin){
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

		
		if(fechaIniVigencia || fechaIniVigencia2){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"FECCONMOV",
					valueHigh: fechaIniVigencia2,
					valueLow:fechaIniVigencia
				});
		}
			  
				 let body = {
					   "ip_canti": idAciertos,
					   "p_option": [
						   
					   ],
					   "p_options": options
				   }
				   console.log(body);
				   var indice=-1;
				  fetch(`${ this.onLocation()}preciospesca/Consultar`,
					   {
						   method: 'POST',
						   body: JSON.stringify(body)
					   })
					   .then(resp => resp.json()).then(data => {

							console.log(data);
						   var dataPrecio = data;
						   for(var i=0;i<dataPrecio.t_prepes.length;i++){
							dataPrecio.t_prepes[i].prcom = parseFloat(dataPrecio.t_prepes[i].prcom).toFixed(2);
							dataPrecio.t_prepes[i].tcant="Tn";

						}
						 
						   this.getView().getModel("estadoPrecio").setProperty("/listaEstadoPrecio",dataPrecio.t_prepes);
						   this.byId("title").setText("Lista de registros: "+dataPrecio.t_prepes.length);
									if(dataPrecio.t_prepes.length<=0){
										this.byId("title").setText("Lista de registros: No se encontraron resultados");
									}
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
			JsonFechaIni.fechaIni2="";
			JsonFechaIni.fechaIni="";
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
		   onDataExport:  function() {
			var oExport = new Export({
				exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
				  separatorChar: ";",
				  charset: "utf-8"
				}),
				//PoliticaPrecio>/listaPolitica
				models: this.getView().getModel("estadoPrecio"),
				rows:{path:""},
				rows: { path: "/listaEstadoPrecio" },
				columns: [
					{
						name: "Semana",
						template: {
						  content: "{colorSemana}"
						}
					  },
					  {
						name: "Pactado",
						template: {
						  content: "{colorPactado}"
						}
					  },
					  {
						name: "Aprobado",
						template: {
						  content: "{colorAprobado}"
						}
					  },
				  {
					name: "Centro",
					template: {
					  content: "{werks}"
					}
				  },
				  {
					name: "Matricula",
					template: {
					  content: "{mremb}"
					}
				  },
				  {
					name: "Embarcacion",
					template: {
					  content: "{nmemb}"
					}
				  },
				  {
					name: "Armador",
					template: {
					  content: "{name1}"
					}
				  },
				  
				  {
					name: "Fecha prod.",
					template: {
					  content: "{fecconmov}"
					}
				  },
				  {
					name: "Cant. descargada",
					template: {
					  content: "{cnpds} {tcant}"
					}
				  },
				  {
					name: "Precio compra",
					template: {
					  content: "{prcom} "
					}
				  },
				  {
					name: "Orden compra",
					template: {
					  content: "{ebeln}"
					}
				  },
				  {
					name: "Doc. contable",
					template: {
					  content: "{lifnr}"
					}
				  },
				  {
					name: "Factura",
					template: {
					  content: "{nrdes}"
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
						new Filter("werks", FilterOperator.Contains, sQuery),
						new Filter("mremb", FilterOperator.Contains, sQuery),
						new Filter("nmemb", FilterOperator.Contains, sQuery),
						new Filter("name1", FilterOperator.Contains, sQuery),
						new Filter("fecconmov", FilterOperator.Contains, sQuery),
						//new Filter("cnpds", FilterOperator.Contains, sQuery),
						//new Filter("prcom", FilterOperator.Contains, sQuery),
						new Filter("ebeln", FilterOperator.Contains, sQuery),
						new Filter("lifnr", FilterOperator.Contains, sQuery),
						new Filter("nrdes", FilterOperator.Contains, sQuery),	
					
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
							new Filter("werks", FilterOperator.Contains, sQuery),
							new Filter("mremb", FilterOperator.Contains, sQuery),
							new Filter("nmemb", FilterOperator.Contains, sQuery),
							new Filter("name1", FilterOperator.Contains, sQuery),
							new Filter("fecconmov", FilterOperator.Contains, sQuery),
							//new Filter("cnpds", FilterOperator.Contains, sQuery),
							//new Filter("prcom", FilterOperator.Contains, sQuery),
							new Filter("ebeln", FilterOperator.Contains, sQuery),
							new Filter("lifnr", FilterOperator.Contains, sQuery),
							new Filter("nrdes", FilterOperator.Contains, sQuery),
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
							this._oDialogArmador = sap.ui.xmlfragment("tasa.com.estadodeprecios.view.DlgArmador", this.getView().getController());
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
					buscarEmbarca: function(evt){
						console.log(evt);
						var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
						console.log(indices);
						var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
						if(this.popEmb==="popEmb"){
							this.byId("idEmbarcacionIni").setValue(data);
						}else if(this.popEmb==="popEmb2"){
							this.byId("idEmbarcacionFin").setValue(data);
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
								this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.estadodeprecios.view.DlgEmbarcacion", this.getView().getController());
								this.getView().addDependent(this._oDialogEmbarcacion);
							}
							sap.ui.getCore().byId("idEmbarcacion").setValue("");
						sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
						sap.ui.getCore().byId("idMatricula").setValue("");
						sap.ui.getCore().byId("idRuc").setValue("");
						sap.ui.getCore().byId("idArmador").setValue("");
							return this._oDialogEmbarcacion;
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
								"p_user": this.usuario,
								"rowcount": idAciertos,
								"rowskips": 0,
								"tabla": "LFA1"
							  }
							  fetch(`${ this.onLocation()}General/Read_table/`,
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
							if(idPropiedad){
								options.push({
									"cantidad": "20",
									"control": "COMBOBOX",
									"key": "INPRP",
									"valueHigh": "",
									"valueLow": idPropiedad
								})
							}
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
							fetch(`${ this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
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
							fetch(`${ this.onLocation()}dominios/Listar/`,
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
				
							fetch(`${ this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
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
				
							fetch(`${ this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
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
								this.oDialog = sap.ui.xmlfragment("tasa.com.estadodeprecios.view.Embarcacion", this);
								this.getView().addDependent(this.oDialog);
							}
							return this.oDialog;
						},
						onOpenEmba: function(evt){
							this.currentInputEmba = evt.getSource().getId();
							this.getDialog().open();
						},
				
						onCerrarEmba: function(){
							this.getDialog().close();
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
						createColumnConfig: function() {
							return [
								{
									label: 'Semana',
									property: 'colorSemana' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Pactado',
									property: 'colorPactado' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Aprobado',
									property: 'colorAprobado' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Centro',
									property: 'werks' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Matrícula',
									property: 'mremb' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Embarcación',
									property: 'nmemb' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Armador',
									property: 'name1' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Fecha prod.',
									property: 'fecconmov' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Cant. Descarga',
									property: 'cnpds' ,
									type: EdmType.Number,
									scale: 3,
									delimiter: true
								},
								{
									label: 'Precio compra',
									property: 'prcom' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Orden compra',
									property: 'ebeln' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Doc. Contable',
									property: 'lifnr' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Factura',
									property: 'nrdes' ,
									type: EdmType.String,
									scale: 2
								}
								];
						},
						onExport: function() {
							var aCols, aProducts, oSettings, oSheet;
				
							aCols = this.createColumnConfig();
							aProducts = this.getView().getModel("estadoPrecio").getProperty('/listaEstadoPrecio');
				
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
								fileName:"REPORTE ESTADO DE PRECIOS"
							};
				
							oSheet = new Spreadsheet(oSettings);
							oSheet.build()
								.then( function() {
									MessageToast.show('El Archivo ha sido exportado correctamente');
								})
								.finally(oSheet.destroy);
						}	
				
		});
	});
