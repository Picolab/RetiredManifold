ruleset manifold {
    meta {
        name "Manifold"
        description <<
Primary ruleset for manifold pico
        >>
        author "PJW's PicoLabs"
        use module b507901x1 alias Wrangler 

        sharing on
        provides wellKnownAppEci
    }

    global {

    wellKnownAppEci = function() {
      wellKnown_app_eci = Wrangler:channel('_wellKnown_app_eci',null,null);
      {
        'status': (wellKnown_app_eci),
        'manifold_eci': wellKnown_app_eci
      };
    }
  }
    rule createManifoldPicoChannel {
      select when manifold create_wellKnown_app_eci
        pre {
          response = http:get('https://raw.githubusercontent.com/burdettadam/Practice-with-KRL/master/manifold/manifoldPrototype.json', {});// ----------------------------------------------needs url to prototype. ---------------------------------------------------------
          response_content = response{"content"}.decode();
          channel_options = response_content{'channels'}.head().klog('channel options');
        }
        /*action*/{ noop();}
        always {
          raise wrangler event "channel_creation_requested" 
            with channel_name = channel_options{'name'}
             and channel_type = channel_options{'type'}
             and attributes = channel_options{'attributes'}
             and policy = channel_options{'policy'};

        log("the problem is not the problem; the problem is your attitude about the problem");
	    }
    }
}
