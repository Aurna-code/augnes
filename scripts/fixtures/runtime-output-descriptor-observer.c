// Test-only direct observation of fd 2 in the isolated forwarding fixture.
// No descriptor open/dup/close, flag change, read, write, or signal handling.
#include <errno.h>
#include <fcntl.h>
#include <libproc.h>
#include <node_api.h>
#include <poll.h>
#include <sys/proc_info.h>
#include <unistd.h>

static napi_value observe(napi_env env, napi_callback_info info) {
  int flags = fcntl(2, F_GETFL);
  struct pollfd descriptor = { .fd = 2, .events = POLLOUT };
  int ready = poll(&descriptor, 1, 0);
  if (flags < 0 || ready < 0) {
    napi_throw_error(env, "descriptor_observer_failed", "fcntl or poll failed");
    return NULL;
  }
  napi_value result, value;
  napi_create_object(env, &result);
  napi_create_int32(env, flags, &value);
  napi_set_named_property(env, result, "flags", value);
  napi_get_boolean(env, (flags & O_NONBLOCK) != 0, &value);
  napi_set_named_property(env, result, "nonblocking", value);
  struct socket_fdinfo socket = {0};
  if (proc_pidfdinfo(getpid(), 2, PROC_PIDFDSOCKETINFO, &socket, sizeof(socket)) != sizeof(socket)) {
    napi_throw_error(env, "descriptor_observer_failed", "socket state unavailable");
    return NULL;
  }
  napi_create_int32(env, socket.psi.soi_state, &value);
  napi_set_named_property(env, result, "socket_state", value);
  napi_get_boolean(env, (socket.psi.soi_state & SOI_S_NBIO) != 0, &value);
  napi_set_named_property(env, result, "socket_nonblocking", value);
  napi_get_boolean(env, (descriptor.revents & POLLOUT) != 0, &value);
  napi_set_named_property(env, result, "writable", value);
  napi_create_int32(env, descriptor.revents & (POLLERR | POLLHUP | POLLNVAL), &value);
  napi_set_named_property(env, result, "terminal_poll_flags", value);
  return result;
}

static napi_value initialize(napi_env env, napi_value exports) {
  napi_value fn;
  napi_create_function(env, "observeStderr", NAPI_AUTO_LENGTH, observe, NULL, &fn);
  napi_set_named_property(env, exports, "observeStderr", fn);
  return exports;
}
NAPI_MODULE(NODE_GYP_MODULE_NAME, initialize)
