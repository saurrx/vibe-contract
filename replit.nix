{ pkgs }: {
  deps = [
    pkgs.rustup
    pkgs.pkg-config
    pkgs.openssl
    pkgs.libudev-zero
    pkgs.nodejs_22
  ];
}
