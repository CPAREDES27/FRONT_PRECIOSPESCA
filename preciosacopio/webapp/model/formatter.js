sap.ui.define([
	
], function () {
	"use strict";

	return {

		disabledItems: function(param){
            var table = this.byId("table");
            
            console.log("entra");
        },
		formatDate: function (date) {
            var fecha = null;

            if (date) {

                fecha = date.split("T")[0];

                fecha = fecha.split("-").reverse().join("/");
            }
            return fecha;

        },

        formatHour: function (hour) {

            var hora = null;

            if (hour) {

                hora = hour.split("T")[1];

                hora = hora.split(":")[0] + ":" + hora.split(":")[1];
            }

            return hora;

        }

	};
});