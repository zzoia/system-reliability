namespace ReliabilityModel.Model.System
{
    public abstract class System
    {
        public MultipleModuleSystem Parent { get; set; }

        public abstract bool IsStateTerminal(SystemState systemState);

        public abstract bool WaitingRecovery(SystemState systemState);

        public abstract bool IsWorking(SystemState systemState);
    }
}