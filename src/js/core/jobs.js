/*
 * FlatTurtle
 * Later.js based jobs object
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

window.Jobs = (function() {

    /*
     * Execute all functions for passed config
     */
    function add(job) {
        log.info("Adding a cronjob");
        log.debug("  Cronjob: ", job);
        var str = job.minutes + " " + job.hours + " " + job.day_of_month + " " + job.month + " " + job.day_of_week;

        //parse the string into a scheduler
        var scheduler = cronParser().parse(str, false);

        //execute a job every next time
        var thisjob = later(1, true); //1 second = min time between 2 occurences, true => use Local time
        thisjob.exec(scheduler, new Date(), execute, job);
    }

    function execute(job){
        log.info("Executing cronjob");
        log.debug("  Cronjob: ", job.javascript);
        try {
            eval(job.javascript);
        } catch(err) {
            //do nothing
        }
    }

    /*
     * Public interface to this object
     */
    return {
        add : add
    };

}());