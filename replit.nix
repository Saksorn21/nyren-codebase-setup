{pkgs}: {
  deps = [
    pkgs.agg
    pkgs.asciinema-agg
    pkgs.asciinema
    pkgs.haskellPackages.bindings-gobject
    pkgs.rubyPackages_3_3.cairo-gobject
    pkgs.rubyPackages_3_2.gobject-introspection
    pkgs.rubyPackages.cairo-gobject
    pkgs.rubyPackages_3_1.gobject-introspection
    pkgs.rubyPackages.gobject-introspection
    pkgs.rubyPackages_3_3.gobject-introspection
    pkgs.rubyPackages_3_1.cairo-gobject
    pkgs.rubyPackages_3_2.cairo-gobject
    pkgs.gobject-introspection
    pkgs.libgtkflow3
    pkgs.ffmpeg_7
    pkgs.apt
    pkgs.python312Packages.python-apt
    pkgs.xorg.libXScrnSaver
    pkgs.nodePackages.node-gyp
  ];
}