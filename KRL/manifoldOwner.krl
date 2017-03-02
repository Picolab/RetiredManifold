ruleset manifold_init {
    meta {
        name "Manifold Owner"
        description <<
Primary ruleset for manifold owner pico
        >>
        author "PJW's PicoLabs"
        use module b507901x1 alias Wrangler 

        sharing on
        provides manifoldChannel
    }

    global {

    manifoldChannel = function() {
      root_children = Wrangler:children();
      children = root_children{"children"};
      manifold_pico = children.filter(function(rec){rec{"name"} eq "_manifold"})
                              .klog("filtered")
                              .head()
                              .klog("manifold pico")
                              ;
      manifold_eci = manifold_pico{"eci"}.klog("eci");
      manifold_channel_return = (manifold_pico.isnull()) => "no_manifold_child"| Wrangler:skyQuery(manifold_eci,"b507901x6.prod","wellKnownAppEci",{},null,null,null);
      manifold_channel = (manifold_pico.isnull()) => "no_manifold_child" | manifold_channel_return{"manifold_eci"};
      manifold_chan = (manifold_pico.isnull()) => "no_manifold_child" | manifold_channel{"channels"};
      {
        'status': (manifold_pico.isnull() eq false),
        'manifoldChannel': manifold_chan
      }.klog("results");
    }
  }
/*
    // ---------- manage manifold singleton ----------
  rule manifoldGuard {
        select when manifold is_manifolded
        pre {
        root_children = Wrangler:children();
        children = root_children{"children"};
        manifold_pico = children.filter(function(rec){rec{"name"} eq "Manifold_Owner"})
                          .head();
        }

	// protect against creating more than one manifold pico (singleton)
	if(manifold_pico.isnull()) then
        {
            send_directive("requesting new Manifold setup");
        }
        
        fired {
            raise manifold event "need_new_manifold_pico" 
            attributes event:attrs()
              //.klog("attributes : ")
              ;
        } else {
	  log ">>>>>>>>>>> Manifold pico exists: " + manifold_pico;
	  log ">> not creating new Manifold pico ";
	}
    }
*/
    rule createManifoldPico {
      select when manifold_owner need_new_manifold_pico
        pre {}
        /*action*/{ noop();}
        always {
          raise wrangler event "add_prototype" 
            with prototype_name = '_manifold_proto'
             and url = 'https://raw.githubusercontent.com/burdettadam/Practice-with-KRL/master/manifold/manifoldPrototype.json';// ----------------------------------------------needs url to prototype. ---------------------------------------------------------
          raise wrangler event "child_creation" 
            with name = '_manifold'
             and prototype = '_manifold_proto';
        log("SUCCESS OFTEN COMES AFTER DISAPPOINTMENTS.");
	    }
    }
    rule createManifoldPicoChannel { // manifold pico is created but some how it needs a channel.
        select when manifold_owner need_new_manifold_pico_channel
        pre {
          root_children = Wrangler:children();
          children = root_children{"children"};
          manifold_pico = children.filter(function(rec){rec{"name"} eq "_manifold"})
                                  .head();
          manifold_eci = manifold_pico{"eci"}.klog("eci");
        }
        {
          event:send({'eci': manifold_eci}, "manifold", "create_wellKnown_app_eci") // send request
            with attrs = event:attrs();
        }
        always {
          log ("FEAR IS BORN OF SATAN!");
      }
    }
}
