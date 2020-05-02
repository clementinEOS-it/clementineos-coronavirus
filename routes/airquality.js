var express = require('express');
var router = express.Router();

/*

router.post('/:net/send', function(req, res, next) {

    var _data = {
        from: req.body.from,
        Countrycode: req.body.Countrycode,
        Namespace: req.body.Namespace,
        AirQualityNetwork: req.body.AirQualityNetwork, 	
        AirQualityStation: req.body.AirQualityStation,
        AirQualityStationEoICode: req.body.AirQualityStationEoICode,
        SamplingPoint: req.body.SamplingPoint,
        SamplingProcess: req.body.SamplingProcess,
        Sample: req.body.Sample,
        AirPollutant: req.body.AirPollutant,
        AirPollutantCode: req.body.AirPollutantCode,
        AveragingTime: req.body.AveragingTime,
        Concentration: req.body.Concentration,
        UnitOfMeasurement: req.body.UnitOfMeasurement,
        DatetimeBegin: req.body.DatetimeBegin,
        DatetimeEnd: req.body.DatetimeEnd,
        Validity: req.body.Validity,
        Verification: req.body.Verification
    };

    var _action = {
        actions: [{
            account: contract.account,
            name: 'post',
            authorization: [{
                actor: contract.account,
                permission: "active"
            }],
        data: _data
        }]
    };

    console.log('Data to send Blockchain: ' + JSON.stringify(_action));

    eosController.runAction(eos, _action, (result)=> {
        res.json(result);
    });

});
*/

module.exports = router;
